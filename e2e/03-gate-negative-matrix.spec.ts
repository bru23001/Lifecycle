import { test, expect } from "./fixtures/lifecycle-test";
import { GATE_IDS } from "./support/constants";
import {
  anchorPhaseForGate,
  assertPhaseUnchanged,
  breakGateEvidence,
  expectGateReviewShowsRemediation,
  expectServerGateAdvanceBlocked,
  satisfyGatePrerequisites,
} from "./support/negative-helpers";
import { getE2ePrisma, seedE2eLifecycleProject } from "./support/db";

const GATE_EVIDENCE_TEMPLATE: Partial<Record<string, string>> = {
  G1: "A-0",
  G2: "A-0.1",
  G3: "A-3.1",
  G4: "A-8",
  G5: "ARD-001",
  G6: "A-14",
  G7: "A-16",
  G8: "A-21",
  G9: "A-27",
  G10: "A-38",
};

test.describe("Gate negative matrix", () => {
  for (const gateId of GATE_IDS) {
    test.describe(`${gateId}`, () => {
      test.beforeEach(async () => {
        await seedE2eLifecycleProject({ reset: true });
      });

      test("blocks Accepted when primary evidence is not approved", async ({ projectId }) => {
        const templateId = GATE_EVIDENCE_TEMPLATE[gateId];
        if (!templateId) return;
        const phaseBefore = anchorPhaseForGate(gateId);
        await satisfyGatePrerequisites(projectId, gateId);
        await breakGateEvidence(projectId, templateId);
        await expectServerGateAdvanceBlocked(projectId, gateId);
        await assertPhaseUnchanged(projectId, phaseBefore);
      });

      test("surfaces remediation on gate review UI when evidence fails", async ({
        page,
        projectId,
      }) => {
        const templateId = GATE_EVIDENCE_TEMPLATE[gateId];
        if (!templateId) return;
        await breakGateEvidence(projectId, templateId);
        if (gateId === "G1") {
          await expectGateReviewShowsRemediation(page, projectId, gateId);
        }
      });
    });
  }

  test("denies G4 review while project remains in phase 1", async ({ page, projectId }) => {
    await expectServerGateAdvanceBlocked(projectId, "G4");
    await assertPhaseUnchanged(projectId, 1);
    await page.goto(`/projects/${projectId}/gates/g4/review`);
    await expect(page.getByText(/Complete G3|Phase 6/i).first()).toBeVisible();
  });

  test("denies G10 before G8/G9 accepted", async ({ page, projectId }) => {
    const prisma = getE2ePrisma();
    await prisma.project.update({
      where: { id: projectId },
      data: { currentPhase: 14 },
    });
    await expectServerGateAdvanceBlocked(projectId, "G10");
    await page.goto(`/projects/${projectId}/gates/g10/review`);
    await expect(
      page.getByText(/Gate G8|Gate G9|deployment completed|maintenance review/i).first(),
    ).toBeVisible();
  });

  test("prevents cross-gate bypass via direct G7 URL at phase 1", async ({ page, projectId }) => {
    await page.goto(`/projects/${projectId}/gates/g7/review`);
    await expect(page.getByRole("heading", { name: "Gate Review" })).toBeVisible();
    await expectServerGateAdvanceBlocked(projectId, "G7");
    await assertPhaseUnchanged(projectId, 1);
  });
});
