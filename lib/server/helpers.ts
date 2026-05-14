export { ALL_GATES } from "@/lib/gate-constants";

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
