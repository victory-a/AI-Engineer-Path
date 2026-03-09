import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    define: {
      'process.env.API_PROXY_TARGET': JSON.stringify(env.API_PROXY_TARGET),
    },
    server: {
      proxy: {
        '/api': {
          target: env.API_PROXY_TARGET || 'http://localhost:8787',
          changeOrigin: true,
        },
      },
    },
  };
});
