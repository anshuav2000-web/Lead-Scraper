
import { defineConfig, loadEnv } from 'vite';
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Netlify env variables are loaded here and mapped to the client-side.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY || '')
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: './index.html',
      },
    },
    server: {
      port: 3000,
    }
  };
});
