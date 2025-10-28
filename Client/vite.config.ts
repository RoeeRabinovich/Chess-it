import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import flowbiteReact from "flowbite-react/plugin/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), flowbiteReact()],
  server: {
    proxy: {
      "/stockfish": {
        target: "http://localhost:8181", // Dev backend
        changeOrigin: true,
      },
      "/users": {
        target: "http://localhost:8181", // Dev backend
        changeOrigin: true,
      },
    },
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Resource-Policy": "cross-origin",
    },
  },
  preview: {
    proxy: {
      "/stockfish": {
        target: "http://localhost:9191", // Production backend
        changeOrigin: true,
      },
      "/users": {
        target: "http://localhost:9191", // Production backend
        changeOrigin: true,
      },
    },
  },
  worker: {
    format: "es",
  },
  optimizeDeps: {
    exclude: ["stockfish.wasm"],
    include: ["react", "react-dom", "react-router-dom"], // Pre-bundle common deps
  },
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code for better caching
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "redux-vendor": ["react-redux", "@reduxjs/toolkit"],
        },
      },
    },
  },
});
