/**
 * @file vite.config.js
 * @description Build- und Dev-Server-Konfiguration für die React-PWA.
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true
  }
});
