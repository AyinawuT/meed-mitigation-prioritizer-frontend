import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawVitePort = process.env.VITE_PORT ?? "3000";
const vitePort = Number(rawVitePort);

if (Number.isNaN(vitePort) || vitePort <= 0) {
  throw new Error(`Invalid VITE_PORT value: "${rawVitePort}"`);
}

const basePath = process.env.BASE_PATH ?? "/";
const apiPort = process.env.PORT ?? "8000";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: vitePort,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    proxy: {
      "/api": {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true,
      },
      "/v1": {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true,
      },
      "/photon-geocode": {
        target: "https://photon.komoot.io",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/photon-geocode/, "/api"),
        headers: { "User-Agent": "MEED-HIAP/1.0" },
      },
    },
  },
  preview: {
    port: vitePort,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
