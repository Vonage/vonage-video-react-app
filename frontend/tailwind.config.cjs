// eslint-disable-next-line @typescript-eslint/no-require-imports
const veraUI = require('../libs/ui/src/theme/helpers/tailwind/veraUI.cjs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const designTokens = require('../designTokens.json');

const { VIDEO_CONTAINER_HEIGHT_WR } = 360;

const config = {
  darkMode: 'class',
  theme: {
    extend: {
      // Project-specific overrides and additions
      keyframes: {
        'fade-in': { '0%': { opacity: '20%' }, '100%': { opacity: '1' } },
        'contributors-crawl': {
          '0%': { transform: 'rotateX(45deg) translateY(0)' },
          '100%': { transform: 'rotateX(45deg) translateY(-50%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-in-out',
        'contributors-crawl': 'contributors-crawl 30s linear infinite',
      },
      height: {
        'video-container': `${VIDEO_CONTAINER_HEIGHT_WR}px`,
      },
    },
  },
  // classes to always allow even if not found in files
  safelist: [...veraUI.safelist],
  plugins: [veraUI(designTokens)],
};

module.exports = config;
