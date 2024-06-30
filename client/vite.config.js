import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      global: path.resolve(__dirname, 'node_modules/global/'),
      buffer: path.resolve(__dirname, 'node_modules/buffer/'),
    },
  },
  define: {
    'process.env': {},
  },
  optimizeDeps: {
    include: ['buffer', 'global'],
  },
});
