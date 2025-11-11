import baseConfig from '../../eslint.config.mjs';

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
    },
  },

  // Fixtures: disable restrictions and allow devDependencies
  {
    files: ['fixtures/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-restricted-imports': 'off',
      'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    },
  },
];
