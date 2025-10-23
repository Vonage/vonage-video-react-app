import { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';
import { colors } from './src/utils/customTheme/customTheme';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        darkGray: {
          55: 'rgb(32, 33, 36, .55)',
          100: 'rgb(32, 33, 36)',
        },
        notVeryGray: {
          55: 'rgba(60, 64, 67, .55)',
          100: 'rgb(60, 64, 67)',
        },
      },
      screens: {
        xs: '350px',
        ...defaultTheme.screens,
      },
      backgroundColor: {
        skeletonLike: colors.backgroundDisabled,
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '20%' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-in-out',
      },
    },
  },
  plugins: [],
};

export default config;
