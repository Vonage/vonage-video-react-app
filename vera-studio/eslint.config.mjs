import globals from 'globals';
import baseConfig from '../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.node,
    },
  },
];
