/** Derive evidence link status from artifact, gate, and phase anchors (junction + row fields). */
export function computeEvidenceLinkStatus(row: {
  status: string;
  artifactLinks: unknown[];
  gateLinks: unknown[];
  phaseLinks: unknown[];
  gateCode: string | null;
  phaseNumber: number | null;
}): "linked" | "partially_linked" | "unlinked" | null {
  if (row.status === "archived") return null;

  const artifactN = row.artifactLinks.length;
  const gateJunctionN = row.gateLinks.length;
  const hasRowGate = Boolean(row.gateCode?.trim());
  const anyGate = gateJunctionN > 0 || hasRowGate;
  const phaseJunctionN = row.phaseLinks.length;
  const hasPhaseAnchor = row.phaseNumber != null || phaseJunctionN > 0;
  const hasWorkspaceRow = hasPhaseAnchor || hasRowGate;

  if (artifactN === 0 && !anyGate && !hasWorkspaceRow) return "unlinked";
  if (artifactN === 0 && !anyGate && hasWorkspaceRow) return "partially_linked";
  if (!anyGate && artifactN > 0) return "partially_linked";
  return "linked";
}
