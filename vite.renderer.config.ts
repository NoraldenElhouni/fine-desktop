import path from "path";
import { defineConfig } from "vite";
import packageJson from "./package.json";

// https://vitejs.dev/config
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5174,
    proxy: {
      "/api": {
        target: "https://api.fine.shards.ly",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE" || warning.message.includes("use client")) {
          return;
        }
        warn(warning);
      },
    },
  },
});
