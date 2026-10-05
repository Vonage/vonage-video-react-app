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
        callees: ['twMerge', 'cn', 'classNames'],
      },
    },
    rules: {
      'tailwindcss/no-custom-classname': [
        'error',
        {
          whitelist: [
            // allow component names to be used as class names
            // this helps to identify components in the DOM
            '^[A-Z][A-Za-z0-9_-]*$',

            'publisher',
            'subscriber',
            'screen-subscriber',
          ],
        },
      ],
    },
  },
];
