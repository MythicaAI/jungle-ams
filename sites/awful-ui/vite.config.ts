import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import type { Plugin, ViteDevServer } from 'vite';
import {v4 as uuidv4} from 'uuid';
// In-memory store for URLs
const urlStore: { [key: string]: string } = {};

// Custom middleware plugin
const gcsKeyMiddleware = (): Plugin => ({
  name: 'gcs-key-middleware',
  configureServer(server: ViteDevServer) {
    server.middlewares.use('/gcs-keys', (req, res) => {
      // Extract path and query string
      const encodedUrlPath = req.originalUrl.replace(/^\/gcs-keys/, '');
      const filename = new URL('http://localhost' + encodedUrlPath).pathname.split('/').pop();


      // Generate a UUID as the key
      const key = `gcsfile_${uuidv4()}_${filename}`;

      // Store the URL path and query string in the in-memory store
      urlStore[key] = encodedUrlPath;

      // Return the generated key as the response (plain text)
      res.setHeader('Content-Type', 'text/plain');
      res.end(key);
    });
    
  }
});

export default defineConfig({
  plugins: [
    gcsKeyMiddleware(),
    react()
  ],
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
    },
    proxy: {
      '/mythica-api': {
        target: 'https://api.mythica.ai/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/mythica-api/, ''),
      },
      '/gcsfile_': {
        target: 'https://storage.googleapis.com',
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
