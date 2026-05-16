import { test, expect } from "@playwright/test";

import { E2E_PROJECT_SLUG } from "./support/constants";
import { getE2eProjectId } from "./support/db";

test.describe("E2E harness smoke", () => {
  test("dashboard loads and healthz responds", async ({ page, request }) => {
    const health = await request.get("/api/healthz");
    expect(health.ok()).toBeTruthy();
    const body = await health.json();
    expect(body).toMatchObject({ ok: true });

    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(/Welcome back,/i)).toBeVisible({ timeout: 30_000 });
  });

  test("e2e lifecycle project resolves", async () => {
    const id = await getE2eProjectId();
    expect(id.length).toBeGreaterThan(5);
    expect(E2E_PROJECT_SLUG).toBe("e2e-lifecycle");
  });
});
