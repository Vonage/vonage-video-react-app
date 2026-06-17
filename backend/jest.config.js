/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  clearMocks: true,
  moduleDirectories: ['ts', 'tsx', 'node_modules'],
  coverageProvider: 'v8',
  roots: ['<rootDir>/'],
  modulePaths: ['<rootDir>'],
  testMatch: ['**/tests/**/*.+(ts|tsx)', '**/?(*.)+(test).+(ts|tsx)'],
  setupFiles: ['<rootDir>/jest/documentPolyfill.js', '<rootDir>/jest/setEnvVars.js'],
  coveragePathIgnorePatterns: ['/node_modules/', '/tests/', '/index\\.ts$'],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/index.ts',

    // interfaces/types files, don't need to be tested
    '!**/storage/sessionStorage.ts',
  ],
  moduleNameMapper: {
    '^@api-lib$': '<rootDir>/../libs/api/src',
    '^@api-lib/(.*)$': '<rootDir>/../libs/api/src/$1',
    '^@common$': '<rootDir>/../libs/common/src',
    '^@common/(.*)$': '<rootDir>/../libs/common/src/$1',
    '^@common-test$': '<rootDir>/../libs/common/test',
    '^@common-test/(.*)$': '<rootDir>/../libs/common/test/$1',
    '^@node$': '<rootDir>/../libs/common/srcNode',
    '^@node/(.*)$': '<rootDir>/../libs/common/srcNode/$1',
  },
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
