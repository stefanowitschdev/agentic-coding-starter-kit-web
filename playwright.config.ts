import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.PORT || "3000";
const baseURL = process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Starts the app for local runs against the database from your .env
  // (POSTGRES_URL). Make sure the dev database is running and migrated first:
  //   podman compose up -d   # or: docker compose up -d
  //   pnpm db:migrate
  // In CI, start the server in a separate step and point PLAYWRIGHT_BASE_URL at it.
  webServer: {
    command: "pnpm dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
