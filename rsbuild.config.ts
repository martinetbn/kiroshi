import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { TanStackRouterRspack } from "@tanstack/router-plugin/rspack";

export default defineConfig({
  plugins: [pluginReact()],
  source: {
    entry: {
      index: "./src/main.tsx",
    },
  },
  tools: {
    rspack: {
      plugins: [TanStackRouterRspack({ target: "react", autoCodeSplitting: true })],
    },
  },
  html: {
    template: "./index.html",
  },
  server: {
    port: 1420,
    strictPort: true,
  },
  dev: {
    hmr: true,
  },
});
