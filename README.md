# Express API with TypeScript

A basic REST API built with Express.js and TypeScript, configured with ESLint, Prettier, and Husky to maintain code quality.

## 🚀 Features

- **Express.js** - Fast and minimalist web framework
- **TypeScript** - Static typing for JavaScript
- **ESLint** - Static code analysis to identify problems
- **Prettier** - Automatic code formatter
- **Husky** - Git hooks to automate tasks before commits
- **Nodemon** - Automatic reload during development

## 📦 Installation

```bash
npm install
```

## 🛠️ Available Scripts

```bash
# Development - Starts the server with automatic reload
npm run dev

# Build - Compiles TypeScript to JavaScript
npm run build

# Production - Runs the compiled version
npm start

# Linting - Analyzes code for problems
npm run lint

# Linting with automatic fixes
npm run lint:fix

# Format - Applies consistent code formatting
npm run format
```

## 🚀 Usage

### Development

```bash
npm run dev
```

The server will run at `http://localhost:3001`

### Production

```bash
npm run build
npm start
```

## 📁 Project Structure

```
hex/
├── src/
│   └── index.ts          # Main entry point
├── dist/                 # Compiled files (generated)
├── .husky/              # Git hooks
├── .gitignore           # Files ignored by Git
├── .npmrc               # Local npm configuration
├── .prettierrc          # Prettier configuration
├── .eslintrc.js         # ESLint configuration
├── nodemon.json         # Nodemon configuration
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md            # This file
```

## 🔧 Available Endpoints

### GET /

Basic test endpoint

```json
{
  "message": "API is working correctly! 🚀",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /health

Server health check

```json
{
  "status": "OK",
  "uptime": 123.456
}
```

## 🛡️ Git Hooks

This project uses Husky to automatically run:

- **pre-commit**: Runs lint-staged which applies ESLint and Prettier to modified files

## 📝 Configuration

### ESLint

- Configured for TypeScript
- Strict rules enabled
- Prettier integration

### Prettier

- Semicolons required
- Single quotes
- Line width: 80 characters
- Tabs: 2 spaces

### TypeScript

- Target: ES2020
- Strict mode enabled
- Source maps enabled
- Type declarations generated

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is under the ISC License.

## How it works the configuration

api-leetcode
| config
  | default.json  # Default Base configuration
  | custom-environment-variables.json
  | test.json # Test environment

The configuration files are managed using the `config` package. Each file corresponds to a specific environment:
## how decide the environment
the library config automatically detects the environment based on the `NODE_ENV` environment variable. If `NODE_ENV` is not set, it defaults to `default.json`.

🏷️ Versioning and Releases

This project uses release-it together with
Conventional Commits (angular preset) to automate versioning, changelog generation, and
Git tags.

Branch flow


next — integration branch where approved PRs are merged. Every push triggers
.github/workflows/release-next.yml, which automatically generates a release candidate
(x.y.z-rc.N) with its corresponding tag.
master — release branch. Merging next → master triggers
.github/workflows/release-master.yml, which generates the stable version (x.y.z),
its tag, and updates CHANGELOG.md.


PR → merge to next → automatic RC (0.1.0-rc.1, rc.2, ...)
                 ↓
        merge next → master → stable version (0.1.0) + CHANGELOG.md

How the version bump is calculated

The bump (major/minor/patch) is determined automatically from commit messages:

Commit prefixBumpfix:patchfeat:minorfeat!: / BREAKING CHANGEmajorchore:, docs:, refactor:, etc.no direct bump, but listed in the changelog

Avoiding duplicate tags/versions

Both workflows run git fetch --tags before executing release-it, and skip themselves
whenever the triggering commit is already a chore: release ... commit (this prevents an
infinite loop between the release commit and the pipeline itself).

Local commands

bashnpm run release:rc   # manually generate an RC (normally done by the pipeline on next)
npm run release      # manually generate a stable version (normally done by the pipeline on master)

Commit convention

feat(auth): add Google login
fix(api): fix timeout on submissions endpoint
chore: release v0.1.0   # generated automatically by release-it, do not write by hand