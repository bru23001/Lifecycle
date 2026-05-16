import { expect, type Page } from "@playwright/test";

import type { GateId } from "@/lib/gateRules";
import { canOpenGateReview } from "@/lib/phaseTransitions";

import { getE2ePrisma, getProjectPhase } from "./db";
import {
  anchorPhaseForGate,
  gateReviewPath,
  openGateReview,
} from "./gate-helpers";
import { recordGateReviewForE2e } from "./record-gate-review";

export { anchorPhaseForGate };

export async function setProjectPhaseForGate(projectId: string, gateId: GateId): Promise<void> {
  const prisma = getE2ePrisma();
  const phase = anchorPhaseForGate(gateId);
  await prisma.project.update({
    where: { id: projectId },
    data: { currentPhase: phase },
  });
  const project = await prisma.project.findUniqueOrThrow({ where: { id: projectId } });
  const eligibility = canOpenGateReview(project.currentPhase, gateId);
  if (!eligibility.ok && gateId !== "G9" && gateId !== "G10") {
    throw new Error(
      `E2E negative setup: cannot open ${gateId} at phase ${phase}: ${eligibility.reason}`,
    );
  }
}

async function recordAcceptedGate(projectId: string, gateId: GateId): Promise<void> {
  const result = await recordGateReviewForE2e({
    projectId,
    gateId,
    decision: "Accepted",
    authorityName: "E2E Negative Setup",
    authorityRole: "Governance",
    nextAction: `Setup accepted decision for ${gateId} prerequisite checks.`,
  });
  if (!result.ok) {
    throw new Error(`Failed to prepare prerequisite ${gateId}: ${result.error}`);
  }
}

/** Ensure prerequisite advance gates are satisfied before testing target gate behavior. */
export async function satisfyGatePrerequisites(projectId: string, gateId: GateId): Promise<void> {
  if (gateId === "G9" || gateId === "G10") {
    await setProjectPhaseForGate(projectId, "G8");
    await recordAcceptedGate(projectId, "G8");
  }

  if (gateId === "G10") {
    await setProjectPhaseForGate(projectId, "G9");
    await recordAcceptedGate(projectId, "G9");
  }

  await setProjectPhaseForGate(projectId, gateId);
}

/** Attempt server-side advance when evidence should fail (no UI). */
export async function expectServerGateAdvanceBlocked(
  projectId: string,
  gateId: GateId,
): Promise<void> {
  const res = await recordGateReviewForE2e({
    projectId,
    gateId,
    decision: "Accepted",
    authorityName: "E2E Negative Test",
    authorityRole: "Governance",
    nextAction: "Should not advance — evidence incomplete for E2E negative matrix.",
  });
  expect(res.ok).toBe(false);
  if (!res.ok && "blockingMessages" in res) {
    expect(res.blockingMessages?.length ?? res.error.length).toBeGreaterThan(0);
  }
}

export async function breakGateEvidence(projectId: string, templateId: string): Promise<void> {
  const prisma = getE2ePrisma();
  const art = await prisma.artifact.findFirst({
    where: { projectId, templateId },
    orderBy: { createdAt: "desc" },
  });
  if (!art) throw new Error(`No artifact ${templateId} for negative test`);
  const data = {
    ...(art.dataJson as Record<string, unknown>),
    approvalStatus: "Draft",
    documentStatus: "Draft",
  };
  await prisma.artifact.update({
    where: { id: art.id },
    data: { dataJson: data, status: "Draft" },
  });
}

export async function expectGateReviewShowsRemediation(
  page: Page,
  projectId: string,
  gateId: GateId,
): Promise<void> {
  await openGateReview(page, projectId, gateId);
  await expect(page.getByText(/Remediation needed|Resolve failing|blocking/i).first()).toBeVisible();
}

export async function expectPrerequisiteDeniedOnGatePage(
  page: Page,
  projectId: string,
  gateId: GateId,
): Promise<void> {
  await page.goto(gateReviewPath(projectId, gateId));
  await expect(page.getByRole("heading", { name: "Gate Review" })).toBeVisible();
  await page.locator("#gate-review-decision-record").scrollIntoViewIfNeeded();
  await page.getByTestId("gate-decision-approve").click({ force: true });
  const confirm = page
    .getByTestId("gate-confirm-approval")
    .or(page.getByRole("button", { name: "Confirm approval" }));
  const confirmVisible = await confirm.isVisible({ timeout: 5_000 }).catch(() => false);
  const confirmEnabled =
    confirmVisible && (await confirm.isEnabled({ timeout: 2_000 }).catch(() => false));
  if (confirmEnabled) {
    await confirm.click();
    await expect(
      page.getByText(/Complete G|Reach Phase|must be in Phase|already cleared/i).first(),
    ).toBeVisible({
      timeout: 15_000,
    });
  } else {
    await expect(
      page.getByText(/Resolve before approval|blocking|Remediation|Complete G|Reach Phase/i).first(),
    ).toBeVisible();
  }
}

export async function assertPhaseUnchanged(projectId: string, expectedPhase: number): Promise<void> {
  const phase = await getProjectPhase(projectId);
  expect(phase).toBe(expectedPhase);
}
