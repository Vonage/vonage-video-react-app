import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ui': path.resolve(__dirname, '../../libs/ui/src'),
      '@common': path.resolve(__dirname, '../../libs/common/src'),
    },
  },
});
