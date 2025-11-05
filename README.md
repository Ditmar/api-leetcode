# Express API con TypeScript

Una API REST básica construida con Express.js y TypeScript, configurada con ESLint, Prettier y Husky para mantener la calidad del código.

## 🚀 Características

- **Express.js** - Framework web rápido y minimalista
- **TypeScript** - Tipado estático para JavaScript
- **ESLint** - Análisis estático de código para identificar problemas
- **Prettier** - Formateador de código automático
- **Husky** - Git hooks para automatizar tareas antes de commits
- **Nodemon** - Recarga automática durante desarrollo

## 📦 Instalación

```bash
npm install
```

## 🛠️ Scripts Disponibles

```bash
# Desarrollo - Inicia el servidor con recarga automática
npm run dev

# Construcción - Compila TypeScript a JavaScript
npm run build

# Producción - Ejecuta la versión compilada
npm start

# Linting - Analiza el código en busca de problemas
npm run lint

# Linting con corrección automática
npm run lint:fix

# Formateo - Aplica formato consistente al código
npm run format
```

## 🚀 Uso

### Desarrollo
```bash
npm run dev
```
El servidor se ejecutará en `http://localhost:3000`

### Producción
```bash
npm run build
npm start
```

## 📁 Estructura del Proyecto

```
hex/
├── src/
│   └── index.ts          # Punto de entrada principal
├── dist/                 # Archivos compilados (generado)
├── .husky/              # Git hooks
├── .gitignore           # Archivos ignorados por Git
├── .npmrc               # Configuración local de npm
├── .prettierrc          # Configuración de Prettier
├── eslint.config.js     # Configuración de ESLint
├── nodemon.json         # Configuración de Nodemon
├── package.json         # Dependencias y scripts
├── tsconfig.json        # Configuración de TypeScript
└── README.md            # Este archivo
```

## 🔧 Endpoints Disponibles

### GET /
Endpoint básico de prueba
```json
{
  "message": "API funcionando correctamente! 🚀",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /health
Health check del servidor
```json
{
  "status": "OK",
  "uptime": 123.456
}
```

## 🛡️ Git Hooks

Este proyecto usa Husky para ejecutar automáticamente:
- **pre-commit**: Ejecuta lint-staged que aplica ESLint y Prettier a los archivos modificados

## 📝 Configuración

### ESLint
- Configurado para TypeScript
- Reglas estrictas habilitadas
- Integración con Prettier

### Prettier
- Punto y coma obligatorio
- Comillas simples
- Ancho de línea: 80 caracteres
- Tabs: 2 espacios

### TypeScript
- Target: ES2020
- Strict mode habilitado
- Source maps habilitados
- Declaraciones de tipos generadas

## 🤝 Contribución

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.