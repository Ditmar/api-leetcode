# Piston Code Runner Adapter (`API-030`)

## 1. Arquitectura del Adaptador y Flujo de Ejecución

El módulo de ejecución de código sigue los principios de **Clean Architecture** (Arquitectura Hexagonal / Puertos y Adaptadores), desacoplando completamente la lógica de negocio del motor de ejecución subyacente (**Piston API v2 self-hosted**).

### Estructura de Capas

1. **Capa de Dominio (`src/domain/code-runner/code-runner.interface.ts`)**:
   - Define el puerto `CodeRunner` y los contratos puros de dominio (`CodeFile`, `ExecutionLimits`, `RunCodeInput`, `ExecutionStatus`, `StageResult`, `RunCodeResult`) sin dependencias externas de librerías ni protocolos HTTP.
2. **Capa de Configuración (`src/config/config-schema.ts` y `config/`)**:
   - Valida al inicio mediante **Zod** todas las variables de entorno y parámetros de Piston (`PISTON_URL`, `PISTON_TOKEN`, `PISTON_COMPILE_TIMEOUT_MS`, `PISTON_RUN_TIMEOUT_MS`, `PISTON_MEMORY_LIMIT_BYTES`, `PISTON_MAX_OUTPUT_SIZE_BYTES`, `PISTON_MAX_CODE_SIZE_BYTES` y `PISTON_LANGUAGE_MAP`).
   - El mapeo de lenguajes (`PISTON_LANGUAGE_MAP`) reside estrictamente en la configuración y nunca se hardcodea en el adaptador.
3. **Capa de Infraestructura (`src/infrastructure/code-runner/`)**:
   - `PistonCodeRunner` (`piston-code-runner.ts`): Adaptador HTTP que se comunica con `${PISTON_URL}/api/v2/execute` y `${PISTON_URL}/api/v2/runtimes` utilizando `fetch` nativo de Node.js.
   - `FakeCodeRunner` (`fake-code-runner.ts`): Doble de pruebas determinista en memoria para tests unitarios que permite configurar `mockResult`, inspeccionar `lastInput` y simular fallos en `validateRuntimes()`.

### Flujo de Ejecución (`run`)

1. **Validación previa**:
   - Verifica que `input.files` contenga al menos un archivo y que la suma total en bytes UTF-8 no supere `PISTON_MAX_CODE_SIZE_BYTES` (64 KB, alineado con el límite de la SPA).
   - Verifica que `input.language` exista dentro de `PISTON_LANGUAGE_MAP`.
   - **Regla de Seguridad**: Jamás se construyen comandos de shell/terminal concatenando código del usuario. El código fuente viaja exclusivamente serializado dentro del arreglo JSON `files`.
2. **Invocación HTTP y Política de Reintentos**:
   - Envía `POST ${PISTON_URL}/api/v2/execute` incluyendo la cabecera `Authorization: Bearer <PISTON_TOKEN>` cuando el token está configurado.
   - Reintenta **máximo 2 veces** (hasta 3 intentos en total) con backoff exponencial **únicamente** ante errores de red (`fetch` rechazado) o respuestas HTTP `5xx` de Piston.
   - **Nunca reintenta** cuando el código del usuario falla en compilación, lanza excepciones en tiempo de ejecución o excede límites de tiempo/memoria (respuestas HTTP 200 con `code != 0` o señales).
   - Si tras agotar los reintentos Piston continúa inaccesible o respondiendo `5xx`, lanza `PistonInfrastructureError`.
3. **Normalización y Mapeo de Estado (`ExecutionStatus`)**:
   - Si `stdout` supera `PISTON_MAX_OUTPUT_SIZE_BYTES` (64 KB), se trunca exactamente a 64 KB y el estado se marca como `output_limit_exceeded`.
   - Si la señal del proceso es `SIGKILL`, `SIGTERM`, `SIGXCPU` o `stderr` indica timeout, el estado se mapea a `time_limit_exceeded`.
   - Si la etapa `compile` retorna `code !== 0`, el estado se mapea a `compile_error`.
   - Si `stderr` reporta agotamiento de memoria (`MemoryError`, `std::bad_alloc`, `out of memory`), el estado se mapea a `memory_limit_exceeded`.
   - Si la etapa `run` retorna `code !== 0` sin ser timeout, el estado se mapea a `runtime_error`.
   - En ejecuciones limpias (`code === 0` y sin señales), el estado es `success`.

---

## 2. Justificación y Funcionamiento de la Medición de `wallTimeMs`

El adaptador mide el tiempo total transcurrido (**wall-clock time**) alrededor de la petición de ejecución hacia Piston utilizando el reloj monotónico de alta resolución `performance.now()` de Node.js (`perf_hooks`):

```ts
const startWallTime = performance.now();
const responsePayload = await this.executeWithRetry(...);
const wallTimeMs = Math.max(0, performance.now() - startWallTime);
```

### ¿Por qué medir `wallTimeMs` en el Runner?

1. **Reloj Monotónico (`performance.now()`)**: A diferencia de `Date.now()`, `performance.now()` no sufre ajustes de reloj del sistema (NTP clock drift) y ofrece precisión sub-milisegundo.
2. **Detección de Bloqueos de E/S y Sleep**: El tiempo de CPU (`cpu_time`) no contabiliza esperas pasivas (`sleep`, bloqueos de descriptores o contención). Medir `wallTimeMs` garantiza visibilidad real sobre cuánto tardó la ejecución de principio a fin.
3. **Observabilidad de Latencia Real del Worker**: Dado que Piston se despliega en la red interna (self-hosted), `wallTimeMs` refleja el tiempo efectivo que el slot de ejecución estuvo ocupado procesando el envío, sirviendo como métrica operativa directa para monitoreo de SLA y colas de ejecución.

---

## 3. Matriz de Pruebas de Abuso de Seguridad (`CD-018`)

La siguiente matriz documenta los vectores de abuso de seguridad evaluados contra el sandbox de **Piston** (aislamiento mediante namespaces de Linux, `cgroups`, límites de recursos `rlimit` y jaula chroot/usuario sin privilegios) y el comportamiento garantizado por `PistonCodeRunner`:

| # | Vector de Abuso (`CD-018`) | Ejemplo de Payload | Mecanismo de Contención en Piston / Adaptador | Resultado Esperado en `PistonCodeRunner` |
| :- | :--- | :--- | :--- | :--- |
| **1** | **Bucle infinito (`Infinite loop`)** | `while (true) {}` / `while True: pass` | Piston aplica `run_timeout` (default `5000 ms`) y `compile_timeout` (`10000 ms`), terminando el árbol de procesos con `SIGKILL` / `SIGXCPU`. | `status: 'time_limit_exceeded'`, `run.signal: 'SIGKILL'` (sin reintentos). |
| **2** | **Salida masiva (`Huge output`)** | `print("A" * 10_000_000)` | Piston limita el buffer de salida del proceso y `PistonCodeRunner` aplica truncado estricto a `PISTON_MAX_OUTPUT_SIZE_BYTES` (`64 KB`). | `status: 'output_limit_exceeded'`, `run.stdout` truncado a `65536` bytes. |
| **3** | **Consumo masivo de memoria (`Big memory`)** | Reservar arreglos/buffers > `128 MB` | Piston aplica `run_memory_limit` y `compile_memory_limit` (`128 MB`) vía `cgroups` / `RLIMIT_AS`. El kernel detiene el proceso por OOM (`SIGKILL` / `MemoryError` / `std::bad_alloc`). | `status: 'memory_limit_exceeded'` (o `'time_limit_exceeded'` / `'runtime_error'` según señal OOM del runtime), proceso contenido a <= 128 MB. |
| **4** | **Fork bomb** | `os.fork()` recursivo / `:(){ :\|:& };:` | Restricción de número máximo de procesos/hilos (`pids.max` en `cgroups` y `RLIMIT_NPROC`) dentro del contenedor de ejecución de Piston. | `fork` falla con `EAGAIN` (`Resource temporarily unavailable`); retorna `status: 'runtime_error'` o `'time_limit_exceeded'` sin degradar el host. |
| **5** | **Llamadas a red (`Network calls`)** | `fetch('https://example.com')` / `socket.connect(...)` | Aislamiento de namespace de red (`CLONE_NEWNET`) en Piston con interfaces externas deshabilitadas. | Fallo inmediato de red (`ENETUNREACH` / `EAI_AGAIN`); retorna `status: 'runtime_error'`. |
| **6** | **Lectura de archivos del sistema (`/etc/passwd`)** | `fs.readFileSync('/etc/passwd')` | Ejecución bajo jaula `chroot` / namespace de montaje aislado (`CLONE_NEWNS`) con sistema de archivos raíz mínimo de solo lectura y usuario efímero sin privilegios. | El proceso solo ve el entorno mínimo aislado del sandbox (sin acceso a secretos, variables de entorno del API ni filesystem del host). |

