import { nextOpenGateForPhase } from "@/lib/gateStatus";
import type { GateDecisionRow } from "@/lib/gateStatus";
import type { SelectedProjectBlocker } from "@/types/projects.types";

export type ProjectBlockerTarget =
  | { kind: "workspace-phase"; phaseNumber: number }
  | { kind: "artifact"; artifactId: string }
  | { kind: "template"; templateId: string }
  | { kind: "evidence-overview"; phaseNumber?: number; gateId?: string }
  | { kind: "evidence"; evidenceId: string }
  | { kind: "gate-review"; gateId: string }
  | { kind: "traceability" };

export function resolveProjectBlockerHref(projectId: string, target: ProjectBlockerTarget): string {
  if (target.kind === "workspace-phase") {
    return `/projects/${projectId}/workspace?phase=${target.phaseNumber}`;
  }
  if (target.kind === "artifact") {
    return `/projects/${projectId}/artifacts/${target.artifactId}`;
  }
  if (target.kind === "template") {
    return `/projects/${projectId}/templates/${target.templateId}`;
  }
  if (target.kind === "evidence") {
    return `/projects/${projectId}/evidence/${target.evidenceId}`;
  }
  if (target.kind === "evidence-overview") {
    const qs = new URLSearchParams();
    if (target.phaseNumber != null) qs.set("phase", String(target.phaseNumber));
    if (target.gateId) qs.set("gate", target.gateId);
    const query = qs.toString();
    const suffix = query ? `?${query}` : "";
    return `/projects/${projectId}/evidence${suffix}`;
  }
  if (target.kind === "gate-review") {
    return `/projects/${projectId}/gates/${target.gateId.toLowerCase()}/review`;
  }
  return `/projects/${projectId}/traceability`;
}

export function resolveProjectBlockersOverviewHref(
  projectId: string,
  blockers: Array<Pick<SelectedProjectBlocker, "target">>,
): string {
  if (blockers.length === 0) return `/projects/${projectId}/evidence`;
  const hasNonTraceabilityBlocker = blockers.some((blocker) => blocker.target.kind !== "traceability");
  if (hasNonTraceabilityBlocker) {
    return `/projects/${projectId}/evidence`;
  }
  return `/projects/${projectId}/traceability`;
}

type ArtifactLite = {
  id: string;
  templateId: string;
  status: string;
};

type EvidenceLite = {
  id: string;
  status: string;
  completenessPercent: number;
  artifactLinks: Array<{ artifactId: string }>;
};

type OpenApprovalLite = {
  approvalType: string;
  gateId: string | null;
  artifactId: string | null;
};

export function buildProjectBlockers(args: {
  projectId: string;
  currentPhase: number;
  traceLinksCount: number;
  latestByGate: Map<string, GateDecisionRow>;
  artifacts: ArtifactLite[];
  evidenceItems: EvidenceLite[];
  openApprovals: OpenApprovalLite[];
}): SelectedProjectBlocker[] {
  const blockers: SelectedProjectBlocker[] = [];
  const push = (
    id: string,
    message: string,
    severity: SelectedProjectBlocker["severity"],
    target: ProjectBlockerTarget,
  ) => {
    blockers.push({
      id,
      message,
      severity,
      target,
      href: resolveProjectBlockerHref(args.projectId, target),
    });
  };

  const openGateApproval = args.openApprovals.find(
    (approval) => approval.approvalType === "gate_review" && approval.gateId != null,
  );
  if (openGateApproval?.gateId) {
    push(
      `open-gate-${openGateApproval.gateId}`,
      `Gate ${openGateApproval.gateId} is awaiting review.`,
      "error",
      { kind: "gate-review", gateId: openGateApproval.gateId },
    );
  }

  const openArtifactApproval = args.openApprovals.find(
    (approval) => approval.approvalType === "artifact_review" && approval.artifactId != null,
  );
  if (openArtifactApproval?.artifactId) {
    push(
      `open-artifact-${openArtifactApproval.artifactId}`,
      "An artifact is awaiting approval.",
      "warning",
      { kind: "artifact", artifactId: openArtifactApproval.artifactId },
    );
  }

  const firstDraftArtifact = args.artifacts.find((artifact) => artifact.status === "Draft");
  if (firstDraftArtifact) {
    push(
      `draft-template-${firstDraftArtifact.templateId}`,
      `Template ${firstDraftArtifact.templateId} is still in draft.`,
      "warning",
      { kind: "template", templateId: firstDraftArtifact.templateId },
    );
  }

  if (args.evidenceItems.length === 0) {
    push(
      "missing-evidence",
      "Missing evidence for the current phase.",
      "error",
      { kind: "evidence-overview", phaseNumber: args.currentPhase },
    );
  }

  const incompleteEvidence = args.evidenceItems.find(
    (evidence) => evidence.completenessPercent < 100 || evidence.status === "unlinked",
  );
  if (incompleteEvidence) {
    push(
      `incomplete-evidence-${incompleteEvidence.id}`,
      "An evidence item is incomplete or unlinked.",
      "warning",
      { kind: "evidence", evidenceId: incompleteEvidence.id },
    );
  }

  const linkedArtifactIds = new Set(
    args.evidenceItems.flatMap((evidence) => evidence.artifactLinks.map((link) => link.artifactId)),
  );
  const artifactMissingEvidence = args.artifacts.find((artifact) => !linkedArtifactIds.has(artifact.id));
  if (artifactMissingEvidence) {
    push(
      `artifact-missing-evidence-${artifactMissingEvidence.id}`,
      `Artifact ${artifactMissingEvidence.templateId} has no linked evidence.`,
      "error",
      { kind: "artifact", artifactId: artifactMissingEvidence.id },
    );
  }

  if (args.traceLinksCount === 0) {
    push(
      "missing-traceability",
      "Traceability links are missing for this project.",
      "warning",
      { kind: "traceability" },
    );
  }

  if (!openGateApproval) {
    const gateId = nextOpenGateForPhase(args.currentPhase, args.latestByGate);
    push(
      `next-gate-${gateId}`,
      `Gate ${gateId} review must be completed before advancing.`,
      "warning",
      { kind: "gate-review", gateId },
    );
  }

  return blockers.slice(0, 5);
}
