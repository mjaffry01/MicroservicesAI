import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const pages = process.env.GITHUB_PAGES === "true";

export default defineConfig({
  base: pages ? "/MicroservicesAI/" : "/",
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
});
