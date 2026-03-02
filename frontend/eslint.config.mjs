import nx from '@nx/eslint-plugin';
import baseConfig from '../eslint.config.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  // add Nx React presets for this app
  ...nx.configs['flat/react'],

  // inherit everything from root
  ...baseConfig,

  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    settings: {
      tailwindcss: {
        config: path.join(__dirname, 'src/css/index.css'),
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      'tailwindcss/no-custom-classname': [
        'error',
        {
          whitelist: [
            'bg-primary-dark',
            'text-darkGray',
            'publisher',
            'subscriber',
            'screen-subscriber',
            'bg-notVeryGray-100',
          ],
        },
      ],
    },
  },
];
