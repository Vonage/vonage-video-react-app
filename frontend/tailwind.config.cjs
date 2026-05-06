// eslint-disable-next-line @typescript-eslint/no-require-imports
const veraUI = require('../libs/ui/src/theme/helpers/tailwind/veraUI.cjs');

const config = {
  darkMode: 'class',
  theme: {
    extend: {
      // Project-specific overrides and additions
      keyframes: {
        'fade-in': { '0%': { opacity: '20%' }, '100%': { opacity: '1' } },
        'raise-hand-in': {
          '0%': { opacity: '0', transform: 'scale(0.3) rotate(-270deg)' },
          '20%': { opacity: '1', transform: 'scale(0.7) rotate(-100deg)' },
          '60%': { transform: 'scale(1.2) rotate(15deg)' },
          '80%': { transform: 'scale(0.9) rotate(-5deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-in-out',
        'raise-hand-in': 'raise-hand-in 600ms ease-out both',
      },
    },
  },
  // classes to always allow even if not found in files
  safelist: [...veraUI.safelist],
  plugins: [veraUI],
};

module.exports = config;
