import { defineConfig } from "vite";
import runtimeEnv from 'vite-plugin-runtime-env';
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  build: {
    sourcemap: true,
  },
  plugins: [react(), tsconfigPaths(), runtimeEnv()],
});
