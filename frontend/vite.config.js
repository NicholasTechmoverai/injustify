// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  build: {
    outDir: 'dist',         // Output goes to frontend/dist
    assetsDir: 'assets',    // Keep assets organized under dist/assets
    emptyOutDir: true,      // Clean dist folder before each build
    rollupOptions: {
      output: {
        // Use relative paths in the output
        // This ensures asset links work when served from /static/
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash][extname]`,
      },
    },
  },

  base: '/static/', // 👈 Crucial: ensures Vite generates correct asset URLs
  // base: '/', // 👈 Crucial: ensures Vite generates correct asset URLs

  server: {
    proxy: {
      '/api': {
        // target: 'http://localhost:8000',
        target: 'https://dragon-brief-mayfly.ngrok-free.app',
        changeOrigin: true,
      },
    },
  },

  preview: {
    headers: {
      'Cache-Control': 'no-store',
    },
  },
});
