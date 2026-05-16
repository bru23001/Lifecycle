import { test as base } from "@playwright/test";

import { E2E_PROJECT_SLUG } from "../support/constants";
import { getE2eProjectId, seedE2eLifecycleProject } from "../support/db";

type LifecycleFixtures = {
  projectId: string;
  projectSlug: string;
};

export const test = base.extend<LifecycleFixtures>({
  projectSlug: E2E_PROJECT_SLUG,
  projectId: async ({}, runFixture) => {
    const e2eDb = process.env.E2E_DATABASE_URL ?? "file:./e2e.db";
    process.env.DATABASE_URL = e2eDb;
    await seedE2eLifecycleProject({ reset: true });
    const id = await getE2eProjectId();
    await runFixture(id);
  },
});

export { expect } from "@playwright/test";
