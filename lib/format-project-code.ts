/** Display project code from slug + vault folder (aligned with projects list). */
export function formatProjectCode(slug: string, vaultFolder: string): string {
  const tail = vaultFolder.split("-")[1] ?? slug.slice(0, 3);
  const prefix = slug.replace(/[^a-z]/gi, "").toUpperCase().slice(0, 3) || "PRJ";
  return `${prefix}-${tail.padStart(3, "0").slice(-3)}`;
}

export function normalizeProjectCodeForConfirm(input: string): string {
  return input.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}
