import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Magnus',
      formats: ['es', 'umd', 'iife']
    },
    minify: 'esbuild',
    target: 'esnext',
  }
})