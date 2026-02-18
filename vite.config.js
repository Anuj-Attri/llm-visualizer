import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/onnx-community': {
        target: 'https://huggingface.co',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
