import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Magnus',
      formats: ['es', 'umd', 'iife']
    },
    minify: false,
    target: 'es2020',
  }
})