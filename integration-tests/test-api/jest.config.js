/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  clearMocks: true,
  moduleNameMapper: {
    '^@api-lib$': '<rootDir>/../../libs/api/src',
    '^@api-lib/(.*)$': '<rootDir>/../../libs/api/src/$1',
    '^@common$': '<rootDir>/../../libs/common/src',
    '^@common/(.*)$': '<rootDir>/../../libs/common/src/$1',
    '^@common-test$': '<rootDir>/../../libs/common/test',
    '^@common-test/(.*)$': '<rootDir>/../../libs/common/test/$1',
    '^@node$': '<rootDir>/../../libs/common/srcNode',
    '^@node/(.*)$': '<rootDir>/../../libs/common/srcNode/$1',
  },
  roots: ['<rootDir>/'],
  modulePaths: ['<rootDir>'],
  testMatch: ['**/*.test.ts'],
  setupFiles: [
    '<rootDir>/../../backend/jest/documentPolyfill.js',
    '<rootDir>/../../backend/jest/setEnvVars.js',
  ],
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
