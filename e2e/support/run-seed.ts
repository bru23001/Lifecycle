/**
 * Standalone E2E lifecycle project seed (uses E2E_DATABASE_URL or file:./e2e.db).
 */
import { config as loadEnv } from "dotenv";

import { disconnectE2ePrisma, seedE2eLifecycleProject } from "./db";

loadEnv();

async function main() {
  process.env.DATABASE_URL = process.env.E2E_DATABASE_URL ?? "file:./e2e.db";
  const projectId = await seedE2eLifecycleProject({ reset: true });
  console.log(`seed:e2e-lifecycle OK — projectId=${projectId}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectE2ePrisma();
  });
