import { defineConfig, mergeConfig } from 'vite';
import baseConfigFn from '../../../vite.config';
import * as path from 'node:path';
import * as fs from 'node:fs';

// Plugin to rename index.html to example.html
function renameOutputHtml() {
  return {
    name: 'rename-output-html',
    writeBundle() {
      const outDir = path.resolve(__dirname, '../../../distRoom');
      const indexPath = path.resolve(outDir, 'index.html');
      const examplePath = path.resolve(outDir, 'example.html');

      if (fs.existsSync(indexPath)) {
        fs.renameSync(indexPath, examplePath);
      }
    },
  };
}

export default defineConfig((env) => {
  const baseConfig = baseConfigFn(env);

  return mergeConfig(baseConfig, {
    root: __dirname,
    base: './',
    plugins: [renameOutputHtml()],
    build: {
      outDir: path.resolve(__dirname, '../../../distRoom'),
      emptyOutDir: false, // Don't clear - vera-room.js should already be there
      rollupOptions: {
        input: path.resolve(__dirname, './index.html'),
      },
    },
  });
});
