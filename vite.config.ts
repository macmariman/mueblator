import tailwindcss from '@tailwindcss/postcss';
import react from '@vitejs/plugin-react';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Relative base: the built site can be served from a subfolder (GitHub Pages).
  base: './',
  css: { postcss: { plugins: [tailwindcss()] } },
  resolve: { alias: { '@': resolve(rootDir, 'src') } },
  plugins: [react()],
  build: { outDir: 'dist', emptyOutDir: true },
});
