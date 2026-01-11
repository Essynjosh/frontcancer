// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // This is the fix we already implemented
  
  // 🔥🔥🔥 ADD THIS BLOCK BELOW 🔥🔥🔥
  server: {
    // This tells Vite to redirect all requests starting with /api
    // to your running backend server (e.g., on port 3000).
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // <-- CHANGE THIS PORT TO YOUR BACKEND'S PORT!
        changeOrigin: true,
        secure: false, // Set to true if your backend uses HTTPS
      },
    },
  },
  // 🔥🔥🔥 END OF BLOCK 🔥🔥🔥
});