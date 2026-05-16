import { test, expect } from "./fixtures/lifecycle-test";
import { GATE_IDS } from "./support/constants";
import { countAuditEvents } from "./support/db";
import { recordGateAccepted } from "./support/gate-helpers";

test.describe.configure({ mode: "serial" });

test.describe("Downstream verification after lifecycle progression", () => {
  test("approval center, audit, reports, and traceability reflect completed gates", async ({
    page,
    projectId,
  }) => {
    test.setTimeout(180_000);

    for (const gateId of GATE_IDS) {
      await recordGateAccepted(projectId, gateId);
    }

    const auditGateCount = await countAuditEvents(projectId, "gate_review.recorded");
    expect(auditGateCount).toBeGreaterThanOrEqual(10);

    await page.goto("/approvals");
    await expect(page.getByRole("heading", { name: /Approval Center/i })).toBeVisible();

    await page.goto(`/projects/${projectId}/audit?gate=G10`);
    await expect(page.getByRole("heading", { name: /G10/i })).toBeVisible();

    await page.goto(`/projects/${projectId}/reports/gate-decisions`);
    await expect(page.getByText(/Gate Decision Report/i).first()).toBeVisible();

    const exportRes = await page.request.get(
      `/api/projects/${projectId}/audit/export?format=json`,
    );
    expect(exportRes.ok()).toBeTruthy();
    const exportJson = await exportRes.json();
    expect(Array.isArray(exportJson)).toBe(true);

    await page.goto(`/projects/${projectId}/traceability`);
    await expect(page.getByText(/Traceability Matrix/i).first()).toBeVisible();

    await page.goto(`/projects/${projectId}/evidence`);
    await expect(page.getByText(/Evidence Center/i).first()).toBeVisible();
  });
});
