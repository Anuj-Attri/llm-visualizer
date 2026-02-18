import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/llm-visualizer/',
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
