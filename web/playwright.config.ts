import { existsSync } from "node:fs";
import { defineConfig } from "@playwright/test";

// Uji alur berjalan terhadap build produksi lokal dan database lokal (npm run db:up && db:migrate && db:seed).
if (existsSync(".env.local")) process.loadEnvFile(".env.local");

const PORT = 3220;

export default defineConfig({
  testDir: "./e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    channel: "chrome", // memakai Chrome yang sudah terpasang; tanpa unduhan browser
    viewport: { width: 1280, height: 900 },
    actionTimeout: 8_000,
  },
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/login`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
