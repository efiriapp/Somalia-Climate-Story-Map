import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: ['**/.tmp-docs/**'],
    },
  },
  test: {
    environment: 'node',
    globals: true,
  },
});
