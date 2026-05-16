import { expect, type Page } from "@playwright/test";

import type { GateId } from "@/lib/gateRules";

import { EXPECTED_PHASE_AFTER_ACCEPT } from "./constants";
import { getE2ePrisma, getLatestGateDecision, getProjectPhase } from "./db";
import { recordGateReviewForE2e } from "./record-gate-review";

/** Workspace phase required before opening a gate review (see `canOpenGateReview`). */
export function anchorPhaseForGate(gateId: GateId): number {
  switch (gateId) {
    case "G1":
      return 1;
    case "G2":
      return 2;
    case "G3":
      return 3;
    case "G4":
      return 6;
    case "G5":
      return 8;
    case "G6":
      return 9;
    case "G7":
      return 12;
    case "G8":
      return 13;
    case "G9":
    case "G10":
      return 14;
    default: {
      const _exhaustive: never = gateId;
      return _exhaustive;
    }
  }
}

export async function ensureProjectPhaseForGate(
  projectId: string,
  gateId: GateId,
): Promise<void> {
  const prisma = getE2ePrisma();
  const target = anchorPhaseForGate(gateId);
  await prisma.project.update({
    where: { id: projectId },
    data: { currentPhase: target },
  });
}

export function gateReviewPath(projectId: string, gateId: GateId): string {
  return `/projects/${projectId}/gates/${gateId.toLowerCase()}/review`;
}

export async function openGateReview(page: Page, projectId: string, gateId: GateId): Promise<void> {
  const url = gateReviewPath(projectId, gateId);
  const heading = page.getByRole("heading", { name: "Gate Review" });
  for (let attempt = 0; attempt < 2; attempt++) {
    await page.goto(url, { waitUntil: "domcontentloaded" });
    try {
      await expect(heading).toBeVisible({ timeout: 30_000 });
      return;
    } catch (error) {
      if (attempt === 1) throw error;
    }
  }
}

/** Record an Accepted gate decision through the Gate Review UI. */
export async function submitGateAcceptedDecision(
  page: Page,
  projectId: string,
  gateId: GateId,
): Promise<void> {
  await ensureProjectPhaseForGate(projectId, gateId);
  await openGateReview(page, projectId, gateId);
  const decisionRecord = page.locator("#gate-review-decision-record");
  await decisionRecord.scrollIntoViewIfNeeded();

  const approveButton = decisionRecord.locator('[data-testid="gate-decision-approve"]:visible').first();
  await approveButton.click({ force: true });
  if ((await approveButton.getAttribute("aria-pressed")) !== "true") {
    await approveButton.focus();
    await page.keyboard.press("Enter");
  }
  await expect(approveButton).toHaveAttribute("aria-pressed", "true", { timeout: 5_000 });
  const confirmApproval = page.locator('[data-testid="gate-confirm-approval"]:visible').first();
  await expect(confirmApproval).toBeVisible({ timeout: 20_000 });
  await expect(confirmApproval).toBeEnabled({ timeout: 20_000 });
  await confirmApproval.click();

  await page.waitForURL(new RegExp(`/projects/${projectId}/workspace`), { timeout: 60_000 });
  await assertProjectPhase(projectId, EXPECTED_PHASE_AFTER_ACCEPT[gateId]);
}

export async function assertProjectPhase(
  projectId: string,
  expectedPhase: number,
): Promise<void> {
  const phase = await getProjectPhase(projectId);
  expect(phase).toBe(expectedPhase);
}

export async function assertGateRecorded(
  projectId: string,
  gateId: GateId,
  decision = "Accepted",
): Promise<void> {
  const row = await getLatestGateDecision(projectId, gateId);
  expect(row).not.toBeNull();
  expect(row?.decision).toBe(decision);
  expect(row?.evidencePassSnapshot).toBe(true);
}

export async function recordGateAccepted(
  projectId: string,
  gateId: GateId,
): Promise<void> {
  await ensureProjectPhaseForGate(projectId, gateId);
  const res = await recordGateReviewForE2e({
    projectId,
    gateId,
    decision: "Accepted",
    authorityName: "E2E Lifecycle Harness",
    authorityRole: "Governance",
    nextAction: `E2E automated acceptance for ${gateId} — proceed to next lifecycle phase.`,
  });
  expect(res.ok, res.ok ? "" : (res as { error: string }).error).toBe(true);
  await assertGateRecorded(projectId, gateId);
  await assertProjectPhase(projectId, EXPECTED_PHASE_AFTER_ACCEPT[gateId]);
}

export async function advanceGateAndAssertPhase(
  page: Page,
  projectId: string,
  gateId: GateId,
): Promise<void> {
  await submitGateAcceptedDecision(page, projectId, gateId);
  await assertGateRecorded(projectId, gateId);
  await assertProjectPhase(projectId, EXPECTED_PHASE_AFTER_ACCEPT[gateId]);
}
