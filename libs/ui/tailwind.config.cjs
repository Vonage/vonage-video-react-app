const veraUI = require('./src/theme/helpers/tailwind/veraUI.cjs');

const config = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
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
