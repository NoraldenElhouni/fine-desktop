import fs from "fs";
import path from "path";
import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDMG } from "@electron-forge/maker-dmg";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import { PublisherGithub } from "@electron-forge/publisher-github";

// @electron-forge/plugin-vite only copies the `.vite/` build output into the
// packaged app (see its packagerConfig.ignore) since Vite/Rollup is expected
// to bundle every dependency. better-sqlite3 is a native module though, so
// vite.main.config.ts marks it `external` instead of bundling it — which
// means nothing ever copies the actual module into the package, and
// `require("better-sqlite3")` fails at runtime with "Cannot find module".
// Copy it in by hand here; AutoUnpackNativesPlugin then takes care of
// pulling its .node binary out of the asar archive.
const NATIVE_MODULES_TO_COPY = ["better-sqlite3"];

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    // better-sqlite3's migration .sql files aren't inside node_modules, so
    // AutoUnpackNativesPlugin won't catch them — copy them out of the asar
    // explicitly so drizzle's migrator can read them from a packaged build.
    extraResource: ["src/db/migrations"],
    ignore: (file) => {
      if (!file) return false;
      if (file.startsWith("/.vite")) return false;
      if (file === "/package.json") return false;
      // keep node_modules so that better-sqlite3 and its native bindings are included.
      // electron-packager will automatically prune devDependencies.
      if (file.startsWith("/node_modules")) return false;
      return true;
    },
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}), // Windows
    new MakerZIP({}, ["darwin"]), // macOS
    new MakerDMG({}, ["darwin"]), // macOS installer
    new MakerRpm({}), // only actually runs on linux runners
    new MakerDeb({}), // only actually runs on linux runners
  ],
  publishers: [
    new PublisherGithub({
      repository: {
        owner: "NoraldenElhouni",
        name: "fine-desktop", // <-- change to your actual repo name
      },
      prerelease: false,
      draft: true, // recommended: review before publishing live
    }),
  ],
  plugins: [
    // better-sqlite3 ships a native .node binding that can't be dlopen'd from
    // inside app.asar — this unpacks it (and any other native deps) automatically.
    new AutoUnpackNativesPlugin({}),
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        { entry: "src/main.ts", config: "vite.main.config.ts", target: "main" },
        {
          entry: "src/preload.ts",
          config: "vite.preload.config.ts",
          target: "preload",
        },
      ],
      renderer: [{ name: "main_window", config: "vite.renderer.config.ts" }],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
  hooks: {
    packageAfterCopy: async (_forgeConfig, buildPath) => {
      // Copy the whole module, including binding.gyp/deps/src — Forge's own
      // rebuildConfig step (electron-rebuild) needs the full source tree to
      // recompile the native addon against the packaged Electron ABI.
      for (const moduleName of NATIVE_MODULES_TO_COPY) {
        const srcDir = path.resolve(__dirname, "node_modules", moduleName);
        const destDir = path.join(buildPath, "node_modules", moduleName);
        fs.cpSync(srcDir, destDir, { recursive: true });
      }
    },
  },
};

export default config;
