import { resolve } from 'node:path';

import preact from '@preact/preset-vite';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      src: resolve(import.meta.dirname, 'src'),
    },
  },
  plugins: [preact()],
});
