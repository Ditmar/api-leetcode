/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: { rootDir: '.' } }],
  },
  testMatch: ['<rootDir>/src/**/*.spec.ts', '<rootDir>/worker/**/*.spec.ts'],
  moduleNameMapper: {
    '^@prisma$': '<rootDir>/src/generated/client',
    '^@logger$': '<rootDir>/src/logger/index',
    '^@config$': '<rootDir>/src/config/config',
  },
  clearMocks: true,
  collectCoverageFrom: ['worker/**/*.ts', '!worker/**/manual-test.ts'],
};
