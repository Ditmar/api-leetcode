# api-leetcode

REST API for a coding practice platform inspired by LeetCode. The application provides authentication, user management, coding problems, courses, contests, tests, and solution submissions.

## Technologies

- Node.js **>= 22.20.0** and TypeScript
- Express 4
- PostgreSQL 13 for the local Docker environment
- Prisma ORM 6
- JWT authentication for protected endpoints using `AuthMiddleware.validateToken`
- Vitest for automated testing
- Swagger UI and OpenAPI 3.0 for API documentation
- ESLint, Prettier, and Husky for code quality

## Requirements

- Node.js **>= 22.20.0** and npm
- Docker with Docker Compose to run the provided local database, or access to an existing PostgreSQL instance

## Local Installation and Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the repository root.

Example development configuration:

```dotenv
PORT=3000
ENV=development
LOG_LEVEL=info

DATABASE_URL="postgresql://your_username:your_password@localhost:5432/leetcode_db"

JWT_SECRET="replace_with_a_long_random_access_token_secret"
JWT_REFRESH_TOKEN_SECRET="replace_with_a_different_long_random_refresh_token_secret"

JWT_EXPIRES_IN=30000
JWT_REFRESH_TOKEN_EXPIRES_IN=604800000
JWT_SALT_ROUNDS=10
```

Replace all example credentials and secrets with appropriate values for your environment.

The token expiration values shown above match the current repository defaults. Verify the units expected by the implementation before changing them.

**Security:** Never commit `.env` files, passwords, or real authentication secrets to Git.

### 3. Start the local database

If you are using the PostgreSQL database provided by the repository, review:

```text
local-database/database.yaml
```

Configure `POSTGRES_USER` and `POSTGRES_PASSWORD` consistently with your `DATABASE_URL`.

Start the database:

```bash
npm run db:up
```

The Docker Compose configuration defines:

- Container: `leetcode-db`
- Database: `leetcode_db`
- Local port: `5432`

An existing PostgreSQL instance can be used instead of Docker.

### 4. Generate the Prisma Client and run migrations

```bash
npx prisma generate
npm run prisma:migrate
```

The `prisma:migrate` script executes:

```bash
npx prisma migrate dev
```

**Important:** This command is intended for development databases. Do not use `prisma migrate dev` directly in production.

### 5. Start the development server

```bash
npm run dev
```

By default, the API runs at:

```text
http://localhost:3000
```

The HTTP port can be changed through the `PORT` environment variable.

**Note:** Database connection and migration commands require an accessible PostgreSQL database. Unit tests using mocks or in-memory repositories may run without a database connection, depending on the test.

## Configuration

The application uses the `config` package to manage its settings.

Relevant configuration files:

- `config/default.json`: Default application settings.
- `config/custom-environment-variables.json`: Mapping between configuration properties and environment variables.
- `config/test.json`: Test-specific configuration.
- `prisma.config.ts`: Prisma configuration, including environment loading, schema location, migrations directory, and database connection settings.

### Environment Variables

| Variable | Description |
| --- | --- |
| `PORT` | HTTP server port. Default: `3000`. |
| `ENV` | Application environment used by the configuration package. |
| `LOG_LEVEL` | Application logging level. |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma. |
| `JWT_SECRET` | Secret used to sign access tokens. |
| `JWT_EXPIRES_IN` | Configured access token expiration. |
| `JWT_SALT_ROUNDS` | Number of rounds used for password hashing. |
| `JWT_REFRESH_TOKEN_SECRET` | Secret used to sign refresh tokens. |
| `JWT_REFRESH_TOKEN_EXPIRES_IN` | Configured refresh token expiration. |

**Important:** `ENV` is mapped to `app.nodeEnv` through `config/custom-environment-variables.json`.

`NODE_ENV` is a separate environment variable that may also affect the behavior of Node.js tools and dependencies. Verify both settings when configuring a specific environment.

## API Documentation

The OpenAPI 3.0 specification is maintained in:

[`openapi.yaml`](./openapi.yaml)

In non-production environments, the interactive Swagger UI is available at:

```text
http://localhost:3000/docs
```

The documentation includes available endpoints, request parameters, request bodies, response schemas, status codes, and example payloads.

Swagger UI is not registered when `config.app.nodeEnv` is set to `production`.

### API Endpoint Groups

| Module | Main Routes | Description |
| --- | --- | --- |
| Health | `/`, `/health`, `/health/live`, `/health/ready` | Application information, liveness, and readiness checks. |
| Authentication | `/api/auth` | User registration, login, token refresh, logout, and authenticated profile. |
| Users | `/api/user` | User management operations. |
| Problems | `/api/problems` | Coding problem listing, retrieval, and management. |
| Courses | `/api/courses` | Course retrieval and enrollment. |
| Contests | `/api/contests` | Contest retrieval, creation, and registration. |
| Tests | `/api/tests` | Test retrieval, session creation, and submission. |
| Submissions | `/api/submissions`, `/api/users/{id}/submissions` | Solution submission and retrieval. |

For detailed endpoint contracts, refer to `openapi.yaml`.

### Authentication and Current Security Behavior

Endpoints marked with `bearerAuth` in the OpenAPI specification require an access token:

```http
Authorization: Bearer <token>
```

The following authentication endpoints do not require an access JWT:

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/refresh`

The logout endpoint receives a `refreshToken` in its JSON request body and does not currently use JWT authentication middleware on its route.

#### Important Security Limitation: Test Endpoints

The following endpoints currently rely on middleware that reads the `x-user-id` request header:

- `POST /api/tests/{id}/start`
- `GET /api/tests/{id}/questions`
- `POST /api/tests/{id}/submit`

This header-based mechanism **does not cryptographically verify user identity** and must not be considered equivalent to JWT authentication.

**Do not use this header as proof of identity in a public production deployment without first implementing proper authentication and authorization.**

## Available npm Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server using Nodemon. |
| `npm run build` | Compile TypeScript and resolve path aliases with `tsc-alias`. |
| `npm start` | Run the compiled application from `dist/index.js`. |
| `npm run lint` | Run ESLint on `src/**/*.ts`. |
| `npm run lint:fix` | Run ESLint with automatic fixes. |
| `npm run format` | Format TypeScript files using Prettier. |
| `npm test` | Run automated tests once using Vitest. |
| `npm run test:watch` | Run Vitest in watch mode. |
| `npm run test:coverage` | Run tests with coverage reporting. |
| `npm run db:up` | Start the local PostgreSQL database using Docker Compose. |
| `npm run prisma:migrate` | Run Prisma development migrations. |

### Build and Run

To build the application:

```bash
npm run build
```

To start the compiled application:

```bash
npm start
```

## Code Quality and Testing

Run the following checks before submitting changes:

```bash
npm run lint
npm test
npm run build
```

Automated tests are implemented with Vitest. Some tests use mocks or in-memory repositories, while integration tests may require additional services.

### Line Ending Considerations

On Windows, ESLint and Prettier may report errors such as:

```text
Delete ␍
```

These errors indicate a mismatch between CRLF and LF line endings.

Before applying automatic fixes, review the repository's formatting conventions and avoid introducing unrelated changes across existing source files.

For a temporary, non-modifying lint check that accepts the current file line endings, run:

```bash
npx eslint "src/**/*.ts" --rule 'prettier/prettier: ["error", {"endOfLine": "auto"}]'
```

This command does not modify the repository configuration.

**Note:** This temporary check does not replace fixing the underlying line-ending inconsistency. The standard `npm run lint` command should pass before the project considers its default lint configuration fully validated.

### OpenAPI Validation

Validate the OpenAPI specification locally:

```bash
npx --yes @apidevtools/swagger-cli validate openapi.yaml
```

This command checks the structure and references of `openapi.yaml`.

It does not guarantee that every endpoint contract matches the runtime implementation.

The command is not currently defined as an npm script in `package.json`.

### GitHub Actions Validation

The repository includes an OpenAPI validation workflow:

```text
.github/workflows/openapi.yml
```

The workflow runs when a Pull Request targets `next` or `master` and modifies either:

- `openapi.yaml`
- `.github/workflows/openapi.yml`

It can also be triggered manually through GitHub Actions.

The workflow uses Node.js 22 and validates the OpenAPI specification with `swagger-cli`.

## Repository Structure

```text
api-leetcode/
├── .github/
│   └── workflows/             # GitHub Actions workflows
├── config/                    # Application and environment configuration
├── local-database/            # Local PostgreSQL Docker configuration
├── prisma/                    # Prisma schema and database migrations
├── src/
│   ├── auth/                  # Authentication module
│   ├── user/                  # User management module
│   ├── problems/              # Coding problems module
│   ├── course/                # Courses module
│   ├── contests/              # Contests module
│   ├── tests/                 # Tests module
│   ├── submissions/           # Solution submissions module
│   ├── share/                 # Shared infrastructure and utilities
│   ├── config/                # Swagger and application configuration
│   └── index.ts               # Application entry point and route registration
├── test/                      # Automated tests
├── openapi.yaml               # OpenAPI 3.0 specification
├── prisma.config.ts           # Prisma configuration
├── package.json               # Dependencies and npm scripts
└── README.md                  # Project documentation
```

## How to Create a New Module

The project organizes its features into modules under `src/`, separating business logic from application and infrastructure concerns.

To implement a new module, follow the existing repository conventions.

### 1. Create the module directory

Create a directory under `src/` using the module name.

For example:

```text
src/new-module/
```

### 2. Organize the module layers

Use the following structure when appropriate:

```text
src/new-module/
├── domain/
├── application/
└── infrastructure/
```

Responsibilities:

- **`domain/`**: Domain entities, business rules, and repository interfaces.
- **`application/`**: Use cases, application services, and Data Transfer Objects (DTOs).
- **`infrastructure/`**: HTTP controllers, routes, database repositories, and external service adapters.

Adapt the structure to the actual requirements of the module while following existing project conventions.

### 3. Implement the business logic

Define the required domain models and application use cases.

Keep business logic independent from Express controllers and Prisma-specific persistence details whenever possible.

Use repository interfaces or other abstractions to separate application logic from infrastructure implementations.

### 4. Implement HTTP routes

Create the required controllers and routes under the infrastructure layer.

Register the module router in:

```text
src/index.ts
```

Apply the appropriate authentication, authorization, and validation mechanisms to each endpoint.

### 5. Update the OpenAPI specification

Document every new or modified endpoint in:

```text
openapi.yaml
```

Include, as applicable:

- HTTP method and path
- Operation summary and description
- Path and query parameters
- Authentication requirements
- Request body schemas
- Successful responses
- Error responses
- Request and response examples

Validate the specification after making changes.

### 6. Add automated tests

Create tests under:

```text
test/
```

Follow the testing conventions already used by the repository.

Tests should cover the relevant business rules, expected results, and error conditions.

### 7. Run project checks

```bash
npm run lint
npm test
npm run build
```

Also validate the API specification:

```bash
npx --yes @apidevtools/swagger-cli validate openapi.yaml
```

If the standard lint command fails because of existing CRLF line-ending inconsistencies, investigate the issue without automatically reformatting unrelated files.

Refer to the existing modules, especially `src/problems/`, for practical examples of the project's architecture and conventions.

## Contribution and Release Workflow

The repository uses the following shared branches:

- **`next`**: Integration branch for approved changes.
- **`master`**: Stable release branch.

### Contributing

1. Create or use a feature branch following the `feature/...` naming convention.
2. Implement the changes associated with the assigned issue.
3. Add or update tests and documentation when necessary.
4. Run the applicable lint, test, build, and OpenAPI validation checks.
5. Update the feature branch against `origin/next` using the rebase procedure agreed upon by the team.
6. Open a Pull Request targeting `next`, following the team's review process.

**Do not push feature changes directly to `next` or `master`.**

### Versioning and Releases

The repository documents a release workflow based on Conventional Commits and GitHub Actions automation.

Review the workflows under `.github/workflows/` for the current release behavior.

The current `package.json` does not define `release` or `release:rc` scripts.

## License

ISC, as declared in `package.json`.