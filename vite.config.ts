import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Bind to 0.0.0.0 so the dev server is reachable from other devices on
    // the LAN (e.g. testing on a phone) via this machine's IP, not just
    // localhost. The proxy below still runs server-side regardless of which
    // IP the browser used to reach Vite, so no separate "dev API host" is
    // needed the way a standalone backend would require.
    host: true,
    // The admin panel UI is this same React app (src/admin) — only its JSON
    // API is PHP. Vite can't execute PHP, so during dev/preview forward just
    // the API calls to the local PHP server (see sss-admin/README.md); the
    // bare /sss-admin route itself is handled client-side, same as production.
    proxy: {
      "/sss-admin/api": "http://localhost:8080",
    },
  },
  build: {
    target: "es2020",
    chunkSizeWarningLimit: 1100,
    rollupOptions: {
      output: {
        // Stable vendor chunks so a content edit doesn't re-download React
        // or GSAP. The three.js ecosystem is NOT listed here: it must stay
        // behind the lazy import(BallCanvas) so first paint never pays for it.
        manualChunks: {
          react: ["react", "react-dom"],
          gsap: ["gsap", "@gsap/react"],
        },
      },
    },
  },
});
