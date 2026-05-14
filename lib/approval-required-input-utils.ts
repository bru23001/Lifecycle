/** Derive link target kind from approval required-input deep links. */
export function requiredInputLinkKind(href?: string): "artifact" | "evidence" | undefined {
  if (!href?.trim()) return undefined;
  if (href.includes("/artifacts/")) return "artifact";
  if (href.includes("/evidence/")) return "evidence";
  return undefined;
}
