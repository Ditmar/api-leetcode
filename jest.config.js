/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  transform: {
    // The base tsconfig has rootDir "./src" (build layout); tests also live
    // under worker/, so ts-jest overrides rootDir just for test compilation.
    '^.+\\.ts$': ['ts-jest', { tsconfig: { rootDir: '.' } }],
  },
  // Unit tests live next to the code they cover, both in src/ and worker/.
  testMatch: ['<rootDir>/src/**/*.spec.ts', '<rootDir>/worker/**/*.spec.ts'],
  moduleNameMapper: {
    '^@prisma$': '<rootDir>/src/generated/client',
    '^@logger$': '<rootDir>/src/logger/index',
    '^@config$': '<rootDir>/src/config/config',
  },
  clearMocks: true,
  collectCoverageFrom: ['worker/**/*.ts', '!worker/**/manual-test.ts'],
};
