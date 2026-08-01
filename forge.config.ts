import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import { PublisherGithub } from "@electron-forge/publisher-github";

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    // better-sqlite3's migration .sql files aren't inside node_modules, so
    // AutoUnpackNativesPlugin won't catch them — copy them out of the asar
    // explicitly so drizzle's migrator can read them from a packaged build.
    extraResource: ["src/db/migrations"],
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}), // Windows
    new MakerZIP({}, ["darwin"]), // macOS
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
};

export default config;
