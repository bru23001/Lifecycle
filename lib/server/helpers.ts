export { ALL_GATES } from "@/lib/gate-constants";

export {
  formatDateLabel,
  formatDateTimeAbsolute,
  formatDateTimeLabel,
  formatDateTimeRelative,
  formatTimeAgoFragment,
  parseFlexibleTimestampLabelMs,
} from "@/lib/datetime-format";

export function projectDisplayCode(vaultFolder: string, slug: string): string {
  if (vaultFolder?.trim()) return vaultFolder.trim();
  return slug.toUpperCase().slice(0, 12);
}

export function isArtifactBodyApproved(dataJson: unknown): boolean {
  const d = dataJson as Record<string, unknown>;
  const s = d.documentStatus ?? d.approvalStatus;
  return s === "Approved";
}
