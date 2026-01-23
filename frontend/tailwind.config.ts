/* eslint-disable @nx/enforce-module-boundaries */
import { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';
import colors from '../libs/ui/src/theme/helpers/designTokens/tokens/color';
import veraTheme from '../libs/ui/src/theme/helpers/tailwind';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Spread Vera UI design tokens
      ...veraTheme,

      // Project-specific overrides and additions
      colors: {
        ...veraTheme.colors,
        darkGray: { 55: 'rgb(32, 33, 36, .55)', 100: 'rgb(32, 33, 36)' },
        notVeryGray: { 55: 'rgba(60, 64, 67, .55)', 100: 'rgb(60, 64, 67)' },
      },
      screens: { xs: '350px', ...defaultTheme.screens },
      backgroundColor: { skeletonLike: colors.light.disabled.value },
      keyframes: { 'fade-in': { '0%': { opacity: '20%' }, '100%': { opacity: '1' } } },
      animation: { 'fade-in': 'fade-in 0.5s ease-in-out' },
    },
  },
  plugins: [],
};

export default config;
