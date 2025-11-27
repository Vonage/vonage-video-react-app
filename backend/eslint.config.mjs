import globals from 'globals';
import baseConfig from '../eslint.config.mjs';

export default [
  ...baseConfig,
  { files: ['**/*.{ts,tsx,js,jsx}'], languageOptions: { globals: globals.node } },
  { files: ['**/*.test.{ts,tsx,js,jsx}'], rules: { '@typescript-eslint/await-thenable': 'off' } },
];
