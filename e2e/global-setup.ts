import { execSync } from "node:child_process";
import path from "node:path";

import { config as loadEnv } from "dotenv";

async function globalSetup(): Promise<void> {
  const root = process.cwd();
  loadEnv({ path: path.join(root, ".env") });

  const e2eDb = process.env.E2E_DATABASE_URL ?? "file:./e2e.db";
  const env = { ...process.env, DATABASE_URL: e2eDb, E2E_DATABASE_URL: e2eDb };

  execSync("npx prisma migrate deploy", {
    cwd: root,
    stdio: "inherit",
    env: { ...env, PRISMA_HIDE_UPDATE_MESSAGE: "1" },
  });

  execSync("npm run seed", {
    cwd: root,
    stdio: "inherit",
    env: {
      ...env,
      SEED_FULL_GLOBAL_RESET: "1",
    },
  });

  execSync("npm run seed:e2e-lifecycle", {
    cwd: root,
    stdio: "inherit",
    env,
  });
}

export default globalSetup;
