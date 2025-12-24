import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // allow LAN and external access
    strictPort: false, // optional: allows Vite to pick a different port if 5173 is busy
    allowedHosts: true, // allow any host (ngrok or LAN IP)
  },
});
