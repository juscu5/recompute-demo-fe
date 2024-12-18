import { rmSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron/simple";
import pkg from "./package.json";
import crypto from "crypto";
import { Plugin } from "vite";

const nonce = crypto.randomBytes(16).toString("base64");

// Custom plugin to inject nonce into HTML
const injectNoncePlugin: Plugin = {
  name: "inject-nonce",
  transformIndexHtml(html) {
    return html
      .replace(
        /<meta http-equiv="Content-Security-Policy" content="[^"]*" \/>/,
        `<meta http-equiv="Content-Security-Policy" content="script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; media-src 'self'; frame-src 'self'; font-src 'self'; connect-src 'self' http://localhost:8080; frame-ancestors 'self'; manifest-src 'self'; form-action 'self';" />`
        // `<meta http-equiv="Content-Security-Policy" content="script-src 'self' data: https://maps.googleapis.com https://maps.gstatic.com https://www.gstatic.com; style-src 'self' data: 'nonce-${nonce}' https://maps.googleapis.com https://maps.gstatic.com https://fonts.googleapis.com https://www.gstatic.com; img-src 'self' data: https://maps.googleapis.com https://maps.gstatic.com https://www.gstatic.com http://maps.google.com; media-src 'self'; frame-src 'self'; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; connect-src 'self' http://localhost:5173 http://localhost:8080 http://192.168.2.250:8080 http://localhost:8080; frame-ancestors 'self'; manifest-src 'self'; form-action 'self';" />`
      )
      .replace(
        /<style>(.*?)<\/style>/g,
        `<style nonce="${nonce}">$1</style>
        <style id="_goober" nonce="${nonce}">(.*?)</style>`
      )
      .replace(
        /<script type="module" src="[^"]*"><\/script>/g,
        `<script type="module" src="/src/main.tsx" nonce="${nonce}"></script>`
      );
  },
};

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  rmSync("dist-electron", { recursive: true, force: true });

  const isServe = command === "serve";
  const isBuild = command === "build";
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG;

  return {
    resolve: {
      alias: {
        "@": path.join(__dirname, "src"),
        "@assets": "/public/assets",
      },
    },
    plugins: [
      react(),
      injectNoncePlugin,
      electron({
        main: {
          // Shortcut of `build.lib.entry`
          entry: "electron/main/index.ts",
          onstart(args) {
            if (process.env.VSCODE_DEBUG) {
              console.log(
                /* For `.vscode/.debug.script.mjs` */ "[startup] Electron App"
              );
            } else {
              args.startup();
            }
          },
          vite: {
            build: {
              sourcemap,
              assetsDir: "assets",
              minify: isBuild,
              outDir: "dist-electron/main",
              rollupOptions: {
                external: Object.keys(
                  "dependencies" in pkg ? pkg.dependencies : {}
                ),
              },
            },
          },
        },
        preload: {
          // Shortcut of `build.rollupOptions.input`.
          // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
          input: "electron/preload/index.ts",
          vite: {
            build: {
              sourcemap: sourcemap ? "inline" : undefined, // #332
              minify: isBuild,
              assetsDir: "assets",
              outDir: "dist-electron/preload",
              rollupOptions: {
                external: Object.keys(
                  "dependencies" in pkg ? pkg.dependencies : {}
                ),
              },
            },
          },
        },
        // Ployfill the Electron and Node.js API for Renderer process.
        // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
        // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
        renderer: {},
      }),
    ],
    server:
      process.env.VSCODE_DEBUG &&
      (() => {
        const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL);
        return {
          host: url.hostname,
          port: +url.port,
        };
      })(),
    clearScreen: false,
  };
});
