import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    return mergeConfig(config, {
      plugins: [tailwindcss()],
      resolve: {
        alias: {
          '@api': resolve(__dirname, '../src/api'),
          '@components': resolve(__dirname, '../src/components'),
          '@Context': resolve(__dirname, '../src/Context'),
          '@hooks': resolve(__dirname, '../src/hooks'),
          '@locales': resolve(__dirname, '../src/locales'),
          '@pages': resolve(__dirname, '../src/pages'),
          '@tests': resolve(__dirname, '../src/tests'),
          '@app-types': resolve(__dirname, '../src/types'),
          '@utils': resolve(__dirname, '../src/utils'),
          '@test': resolve(__dirname, '../src/test'),
          '@ui': resolve(__dirname, '../../libs/ui/src'),
          '@common': resolve(__dirname, '../../libs/common/src'),
          '@core': resolve(__dirname, '../../libs/core/src'),
        },
      },
    });
  },
};

export default config;
