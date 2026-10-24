/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Gera mapas de código para depurar erros de produção (Lighthouse: "missing source maps")
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          ui: ["@radix-ui/react-tabs", "@radix-ui/react-alert-dialog", "@radix-ui/react-toast"],
        },
      },
    },
  },
  test: {
    include: ["src/**/*.test.ts", "workers/**/*.test.ts"],
    environment: "node",
  },
});
