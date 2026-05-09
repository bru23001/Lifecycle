import type { GateId } from "@/lib/gateRules";

/** Shared solo-user display for local lifecycle platform (no auth). */
export const SOLO_USER_DISPLAY = {
  name: "Local User",
  role: "Lifecycle Owner",
  initials: "LU",
} as const;

export function formatDateTimeLabel(d: Date): string {
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export function projectDisplayCode(vaultFolder: string, slug: string): string {
  if (vaultFolder?.trim()) return vaultFolder.trim();
  return slug.toUpperCase().slice(0, 12);
}

export function isArtifactBodyApproved(dataJson: unknown): boolean {
  const d = dataJson as Record<string, unknown>;
  const s = d.documentStatus ?? d.approvalStatus;
  return s === "Approved";
}

export const ALL_GATES: GateId[] = [
  "G1",
  "G2",
  "G3",
  "G4",
  "G5",
  "G6",
  "G7",
  "G8",
  "G9",
  "G10",
];
