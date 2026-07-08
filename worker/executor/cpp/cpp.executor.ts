import path from 'path';
import fs from 'fs/promises';
import os from 'os';
import { DockerRunner } from '../docker-runner';
import type {
  LanguageExecutor,
  ExecutorInput,
  ExecutorOutput,
  TestCaseResult,
  TestCaseStatus,D
} from '../executor.interface';

const IMAGE = 'executor-cpp:latest';

// --- FIX #1 (DevJTG): pids-limit separado para compile y run ---
// El binario del usuario (no confiable) se mantiene estrangulado.
const CPP_RUN_PIDS_LIMIT = 32;
// g++ genera varios subprocesos (cc1plus, as, ld, collect2); templates
// pesados forkean aún más, así que la compilación necesita más holgura.
const CPP_COMPILE_PIDS_LIMIT = 128;

// La compilación no depende del input de los tests: le damos un presupuesto
// fijo y generoso en vez del timeout por-test (que puede ser muy corto).
const COMPILE_TIMEOUT_MS = 15_000;

const COMPILE_SCRIPT = `#!/bin/sh
g++ -std=c++17 -O2 -o /code/solution /code/solution.cpp
exit $?
`;

const RUN_SCRIPT = `#!/bin/sh
/code/solution
exit $?
`;

// --- FIX #2 (DevJTG): normalización de salida ---
// .trim() solo recorta los extremos del string completo. Esto normaliza
// saltos de línea (CRLF -> LF), espacios al final de cada línea y líneas
// en blanco finales, para evitar "wrong answer" falsos entre plataformas.
function normalizeOutput(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n+$/, '');
}

export class CppExecutor implements LanguageExecutor {
  readonly language = 'cpp' as const;

  constructor(
    private readonly dockerRunner: DockerRunner = new DockerRunner()
  ) {}

  async execute(input: ExecutorInput): Promise<ExecutorOutput> {
    const tmpDir = await fs.mkdtemp(
      path.join(os.tmpdir(), `cpp-${input.submissionId}-`)
    );

    try {
      // mkdtemp crea el directorio con modo 0700 propiedad del usuario host,
      // pero el contenedor corre como uid 1001 (usuario 'executor' no-root).
      // Lo abrimos para que el contenedor pueda leer solution.cpp y escribir
      // el binario compilado en /code.
      await fs.chmod(tmpDir, 0o777);

      await fs.writeFile(path.join(tmpDir, 'solution.cpp'), input.code, {
        mode: 0o644,
      });
      await fs.writeFile(path.join(tmpDir, 'compile.sh'), COMPILE_SCRIPT, {
        mode: 0o755,
      });
      await fs.writeFile(path.join(tmpDir, 'run.sh'), RUN_SCRIPT, {
        mode: 0o755,
      });

      const compileResult = await this.dockerRunner.run({
        image: IMAGE,
        command: ['sh', '/code/compile.sh'],
        tmpDir,
        timeoutMs: COMPILE_TIMEOUT_MS,
        memoryMb: input.memoryMb,
        pidsLimit: CPP_COMPILE_PIDS_LIMIT, // FIX #1
      });

      if (compileResult.exitCode !== 0) {
        return {
          status: 'compile_error',
          testCaseResults: [],
          totalRuntimeMs: 0,
          peakMemoryMb: 0,
          compileError: compileResult.stderr || 'Compilation failed',
        };
      }

      const testCaseResults: TestCaseResult[] = [];
      let totalRuntimeMs = 0;
      let overallStatus: ExecutorOutput['status'] = 'accepted';

      for (const tc of input.testCases) {
        const start = Date.now();
        const { stdout, exitCode, timedOut } = await this.dockerRunner.run({
          image: IMAGE,
          command: ['sh', '/code/run.sh'],
          tmpDir,
          timeoutMs: input.timeoutMs,
          memoryMb: input.memoryMb,
          pidsLimit: CPP_RUN_PIDS_LIMIT, // FIX #1
          stdin: tc.input,
        });
        const runtimeMs = Date.now() - start;
        totalRuntimeMs += runtimeMs;

        let status: TestCaseStatus;
        let actualOutput = '';

        if (timedOut) {
          status = 'time_limit_exceeded';
        } else if (exitCode !== 0) {
          // Salida distinta de 0 tras compilar OK = crash del programa
          // (segfault, abort, excepción no capturada, etc.)
          status = 'runtime_error';
        } else {
          // FIX #2: comparación normalizada línea por línea.
          actualOutput = normalizeOutput(stdout);
        status =
          actualOutput === normalizeOutput(tc.expectedOutput) ? 'passed' : 'failed';
        }

        const passed = status === 'passed';

        testCaseResults.push({
          testCaseId: tc.id,
          passed,
          status,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          actualOutput,
          runtimeMs,
        });

        if (!passed && overallStatus === 'accepted') {
          if (status === 'failed') {
            overallStatus = 'wrong_answer';
          } else if (
            status === 'runtime_error' ||
            status === 'time_limit_exceeded'
          ) {
            overallStatus = status;
          }
        }
      }

      return {
        status: overallStatus,
        testCaseResults,
        totalRuntimeMs,
        // --- FIX #3 (DevJTG): NO reportar el límite configurado como si fuera
        // el pico real. Medir el consumo real requiere leer memory.peak del
        // cgroup (o `docker stats`) en DockerRunner. Hasta implementarlo,
        // devolvemos 0 en vez de una métrica engañosa. Ver issue de seguimiento.
        // TODO(API-EXE-004): peak real desde DockerRunner.run().
        peakMemoryMb: 0,
      };
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  }
}
