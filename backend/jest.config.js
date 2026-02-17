/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  clearMocks: true,
  moduleDirectories: ['ts', 'tsx', 'node_modules'],
  moduleNameMapper: {
    '^@common/(.*)$': '<rootDir>/../libs/common/src/$1',
    '^@common$': '<rootDir>/../libs/common/src',
  },
  coverageProvider: 'v8',
  roots: ['<rootDir>/'],
  testMatch: ['**/tests/**/*.+(ts|tsx)', '**/?(*.)+(test).+(ts|tsx)'],
  setupFiles: ['<rootDir>/jest/setEnvVars.js'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        useESM: true,
      },
    ],
  },
};
