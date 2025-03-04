import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts';


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({ insertTypesEntry: true })
  ],
  build: {
    target: 'es2022', // Or a modern browser version like 'chrome91'
    sourcemap: true,  
    lib: {
      entry: 'src/index.ts', // or .jsx/.js if not using TS
      name: 'houdiniUI',
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      // Ensure React is treated as an external peer dependency
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});
