import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default [
  ...nx.configs['flat/react'],

  ...baseConfig,

  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    settings: {
      tailwindcss: {
        config: path.join(__dirname, 'src/styles.css'),
      },
    },
    rules: {
      'tailwindcss/no-custom-classname': [
        'error',
        {
          whitelist: ['publisher', 'subscriber', 'screen-subscriber'],
        },
      ],
    },
  },
];
