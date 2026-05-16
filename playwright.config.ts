import path from "node:path";

import { defineConfig, devices } from "@playwright/test";

const root = process.cwd();
const e2ePort = process.env.E2E_PORT ?? "3011";
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${e2ePort}`;
const e2eDb = process.env.E2E_DATABASE_URL ?? "file:./e2e.db";
process.env.E2E_DATABASE_URL = e2eDb;
process.env.DATABASE_URL = e2eDb;

export default defineConfig({
  testDir: path.join(root, "e2e"),
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never", outputFolder: "playwright-report" }]]
    : [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  globalSetup: path.join(root, "e2e/global-setup.ts"),
  globalTeardown: path.join(root, "e2e/global-teardown.ts"),
  use: {
    baseURL,
    trace: process.env.CI ? "retain-on-failure" : "on-first-retry",
    screenshot: "only-on-failure",
    video: process.env.CI ? "retain-on-failure" : "off",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  outputDir: path.join(root, "test-results"),
  webServer: {
    command:
      process.env.E2E_USE_PROD_SERVER === "1"
        ? `npm run start -- -p ${e2ePort}`
        : `npx next dev -p ${e2ePort}`,
    url: `${baseURL}/api/healthz`,
    reuseExistingServer: false,
    timeout: 300_000,
    env: {
      ...process.env,
      DATABASE_URL: e2eDb,
      PORT: e2ePort,
    },
  },
});
