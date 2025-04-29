import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        practice: resolve(__dirname, 'practice.html'),
        background: resolve(__dirname, 'src/extension/background.ts'),
        content: resolve(__dirname, 'src/extension/content-script.ts'),
        practiceScript: resolve(__dirname, 'src/extension/practice.ts') // explicitly include TS logic for practice
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
    polyfillModulePreload: false
  }
});