import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// In-memory store for URLs
const urlStore: { [key: string]: string } = {};


export default defineConfig({
  plugins: [
    react()
  ],
  base: '/awful/',
  build: {
    target: 'es2022', // Or a modern browser version like 'chrome91'
    sourcemap: true,
  },
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
    host: '0.0.0.0',
    port: 5174,
    proxy: {
      '/mythica-api': {
        target: 'http://localhost:5555/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mythica-api/, ''),
      },
      '/gcsfile_': {
        target: 'https://localhost:9000',
        changeOrigin: true,
        rewrite: (path) => {
          // Extract the key from the path
          const key = path.replace(/^\//, '');

          // Look up the original URL in the store
          const originalUrl = urlStore[key];
          if (!originalUrl) {
            throw new Error(`URL not found for key: ${key}`);
          }

          return originalUrl; // Rewrite to the original URL
        },
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Connection', 'keep-alive');
            proxyReq.setHeader('Keep-Alive', 'timeout=5, max=1000');
          });
          proxy.on('proxyRes', (proxyRes) => {
            proxyRes.headers['content-type'] =  '';
            proxyRes.headers['Cross-Origin-Embedder-Policy']= "require-corp";
            proxyRes.headers['Cross-Origin-Opener-Policy']= "same-origin";
            proxyRes.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0';
            proxyRes.headers['Pragma']= 'no-cache';
            proxyRes.headers['Expires']= '0'      
            const headers = [
              'x-goog-generation',
              'x-goog-metageneration',
              'x-goog-stored-content-encoding',
              'x-goog-stored-content-length',
              'x-goog-hash',
              'x-goog-storage-class',
              'accept-ranges',
              'x-guploader-uploadid',
              'server',
              'alt-svc',
            ];
            headers.forEach((header) => delete proxyRes.headers[header])
          });
        }
      },
    },
  },
});
