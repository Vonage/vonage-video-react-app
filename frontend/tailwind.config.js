/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        darkGray: { 55: 'rgb(32, 33, 36, .55)', 100: 'rgb(32, 33, 36)' },
        notVeryGray: { 55: 'rgba(60, 64, 67, .55)', 100: 'rgb(60, 64, 67)' },
      },
      screens: { xs: '350px', ...defaultTheme.screens },
    },
  },
  plugins: [],
};
