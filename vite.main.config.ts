import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig(async () => {
  // vite-plugin-static-copy is ESM-only, but electron-forge loads this config
  // file itself through a CJS-based esbuild pipeline, so it can't be a static
  // top-level import (esbuild would try to `require()` it and blow up). A
  // dynamic import inside an async config factory works from either side.
  const { viteStaticCopy } = await import("vite-plugin-static-copy");

  return {
    build: {
      rollupOptions: {
        external: ["better-sqlite3", "bindings"],
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    plugins: [
      // drizzle-kit writes migrations as plain .sql + meta/_journal.json files,
      // which Rollup won't pick up since nothing imports them. Copy the folder
      // next to the bundled main.js so migrate({ migrationsFolder }) can find
      // it at runtime via path.join(__dirname, "migrations").
      viteStaticCopy({
        targets: [{ src: "src/db/migrations", dest: "." }],
      }),
    ],
  };
});
