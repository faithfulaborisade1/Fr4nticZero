/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { proxy: { "/api/crew": "http://127.0.0.1:8787" }, fs: { deny: ["**/.env", "**/.env.*", "**/*.{crt,pem}", "**/*.local"] } },
  test: { environment: "node", include: ["src/**/*.test.ts"] },
});
