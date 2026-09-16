import globals from 'globals';
import baseConfig from '../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['tests/helpers/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'CallExpression[callee.name=/^(describe|it|test|xdescribe|xit|xtest|fdescribe|fit)$/], ' +
            'CallExpression[callee.object.name=/^(describe|it|test)$/][callee.property.name=/^(only|skip|each)$/]',
          message:
            'tests/helpers is for test utilities only and is ignored by Jest. Move test suites into tests/ instead.',
        },
      ],
    },
  },
];
