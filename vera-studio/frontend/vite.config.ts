/* eslint-disable @typescript-eslint/ban-ts-comment */
import { defineConfig } from 'vite';
// @ts-ignore
import react from '@vitejs/plugin-react';
// @ts-ignore
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

const studioFrontendRootPath = path.resolve(__dirname);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      ignored: (watchedPath) => {
        const resolvedWatchedPath = path.resolve(watchedPath);
        return !resolvedWatchedPath.startsWith(studioFrontendRootPath);
      },
    },
  },
  resolve: {
    alias: {
      '@ui': path.resolve(__dirname, '../../libs/ui/src'),
      '@common': path.resolve(__dirname, '../../libs/common/src'),
      '@web': path.resolve(__dirname, '../../libs/common/srcBrowser'),
    },
  },
});
