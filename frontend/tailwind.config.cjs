// eslint-disable-next-line @typescript-eslint/no-require-imports
const veraUI = require('../libs/ui/src/theme/helpers/tailwind/veraUI.cjs');

const config = {
  darkMode: 'class',
  theme: {
    extend: {
      // Project-specific overrides and additions
      keyframes: {
        'fade-in': { '0%': { opacity: '20%' }, '100%': { opacity: '1' } },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-in-out',
      },
    },
  },
  // classes to always allow even if not found in files
  safelist: [...veraUI.safelist],
  plugins: [veraUI],
};

module.exports = config;
