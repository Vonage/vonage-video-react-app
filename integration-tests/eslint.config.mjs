import baseConfig from '../eslint.config.mjs';

export default [
  // Inherit everything from the root
  ...baseConfig,

  // Integration test–specific overrides
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@playwright/test',
              importNames: ['test'],
              message: 'Please import test from testWithLogging',
            },
          ],
        },
      ],

      // TODO: enable again once we fix all violations
      // fix also strictNullChecks in tsconfig above
      'import/no-extraneous-dependencies': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      'import/no-extraneous-dependencies': 'off',
      'react-hooks/rules-of-hooks': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },

  // Fixtures: disable restrictions and allow devDependencies
  {
    files: ['fixtures/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': 'off',
      //[todo: re-enable once all violations are fixed]
      // 'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    },
  },
];
