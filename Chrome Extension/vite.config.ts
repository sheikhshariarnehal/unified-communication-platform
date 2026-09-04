import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { buildSync } from 'esbuild';

function chromeExtensionPlugin() {
  return {
    name: 'chrome-extension-builder',
    closeBundle() {
      // 1. Bundle content script as standalone self-contained IIFE
      buildSync({
        entryPoints: [resolve(__dirname, 'src/content/index.ts')],
        bundle: true,
        outfile: resolve(__dirname, 'dist/content.js'),
        format: 'iife',
        target: 'chrome100',
        sourcemap: false
      });

      // 2. Bundle background service worker as standalone ESM
      buildSync({
        entryPoints: [resolve(__dirname, 'src/background/service-worker.ts')],
        bundle: true,
        outfile: resolve(__dirname, 'dist/service-worker.js'),
        format: 'esm',
        target: 'chrome100',
        sourcemap: false
      });

      console.log('✓ Successfully bundled standalone content.js and service-worker.js');
    }
  };
}

export default defineConfig({
  plugins: [react(), chromeExtensionPlugin()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, 'sidepanel.html'),
        popup: resolve(__dirname, 'popup.html'),
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});
