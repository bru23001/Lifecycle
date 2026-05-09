/**
 * Regression checks for unified workspace phases (1–14) and gates G1–G10.
 * Run: npm run phase-model-check
 */
import assert from "node:assert/strict";

import type { GateDecisionRow } from "@/lib/gateStatus";
import { indexLatestGateDecisions } from "@/lib/gateStatus";
import { canOpenGateReview, nextPhaseAfterGateDecision } from "@/lib/phaseTransitions";
import {
  clampWorkspacePhase,
  domainPhaseForWorkspaceIndex,
  workspaceNavigatorIndex,
} from "@/lib/workspacePhases";

function decisionRow(
  gateId: string,
  decision: string,
  evidencePassSnapshot: boolean,
): GateDecisionRow {
  return {
    gateId,
    decision,
    evidencePassSnapshot,
    createdAt: new Date(),
  };
}

function main() {
  assert.equal(clampWorkspacePhase(0), 1);
  assert.equal(clampWorkspacePhase(15), 14);
  assert.equal(clampWorkspacePhase(Number.NaN), 1);
  assert.equal(clampWorkspacePhase(3.7), 3);

  for (let i = 1; i <= 14; i++) {
    assert.equal(domainPhaseForWorkspaceIndex(i), i);
    assert.equal(workspaceNavigatorIndex(i), i);
  }

  assert.equal(nextPhaseAfterGateDecision("G1", "Accepted", true, 1), 2);
  assert.equal(nextPhaseAfterGateDecision("G3", "Accepted", true, 4), 6);
  assert.equal(nextPhaseAfterGateDecision("G4", "Accepted", true, 6), 7);
  assert.equal(nextPhaseAfterGateDecision("G6", "Accepted", true, 9), 10);
  assert.equal(nextPhaseAfterGateDecision("G7", "Accepted", true, 12), 13);
  assert.equal(nextPhaseAfterGateDecision("G8", "Accepted", true, 13), 14);

  assert.equal(canOpenGateReview(6, "G4").ok, true);
  assert.equal(canOpenGateReview(12, "G7").ok, true);
  assert.equal(canOpenGateReview(13, "G8").ok, true);

  const noDecisions = indexLatestGateDecisions([]);
  assert.equal(canOpenGateReview(14, "G9", noDecisions).ok, false);

  const afterG8 = indexLatestGateDecisions([
    decisionRow("G8", "Accepted", true),
  ]);
  assert.equal(canOpenGateReview(14, "G9", afterG8).ok, true);

  const afterG9 = indexLatestGateDecisions([
    decisionRow("G9", "Accepted", true),
    decisionRow("G8", "Accepted", true),
  ]);
  assert.equal(canOpenGateReview(14, "G10", afterG9).ok, true);

  const beforeG9 = indexLatestGateDecisions([
    decisionRow("G8", "Accepted", true),
  ]);
  assert.equal(canOpenGateReview(14, "G10", beforeG9).ok, false);

  console.log("phase-model-check OK");
}

main();
