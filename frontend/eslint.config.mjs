import nx from '@nx/eslint-plugin';
import baseConfig from '../eslint.config.mjs';

export default [
  // add Nx React presets for this app
  ...nx.configs['flat/react'],

  // inherit everything from root
  ...baseConfig,

  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    settings: {
      tailwindcss: {
        // path is relative to THIS file (frontend/)
        config: './tailwind.config.js',
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

            // custom tailwind classes defined in our tailwind.config.ts
            'animate-fade-in',
          ],
        },
      ],
    },
  },
];
