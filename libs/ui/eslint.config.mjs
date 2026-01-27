import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
  ...nx.configs['flat/react'],

  ...baseConfig,

  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    settings: {
      tailwindcss: {
        // path is relative to THIS file (frontend/)
        config: './tailwind.config.cjs',
      },
    },
    rules: {
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
