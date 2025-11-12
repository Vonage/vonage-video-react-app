import nx from '@nx/eslint-plugin';
import baseConfig from '../eslint.config.mjs';

export default [
  // inherit everything from root
  ...baseConfig,

  // add Nx React presets for this app
  ...nx.configs['flat/react'],

  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    settings: {
      tailwindcss: {
        // path is relative to THIS file (frontend/)
        config: './tailwind.config.js',
      },
    },
  },
];
