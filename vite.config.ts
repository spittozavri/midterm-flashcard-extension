import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  root: '.', // make sure root is set
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'practice.html'), // 👈 this is now the entry
        popup: resolve(__dirname, 'popup.html'),
        background: resolve(__dirname, 'src/extension/background.ts'),
        content: resolve(__dirname, 'src/extension/content-script.ts'),
        practiceScript: resolve(__dirname, 'src/extension/practice.ts')
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
        manualChunks: undefined
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
    polyfillModulePreload: false,
  }
});
