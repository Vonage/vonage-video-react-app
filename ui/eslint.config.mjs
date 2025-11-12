import nx from '@nx/eslint-plugin';
import baseConfig from '../eslint.config.mjs';

export default [
  ...baseConfig,

  {
    files: ['src/**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.lib.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {},
  },

  {
    files: ['src/**/*.{spec,test}.{ts,tsx,js,jsx}', 'vite.config.{ts,mts}'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.spec.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {},
  },

  ...nx.configs['flat/react'],
];
