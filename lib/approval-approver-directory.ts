export type ApproverDirectoryEntry = {
  id: string;
  name: string;
  role: string;
  email: string;
};

/** Mock directory until directory API exists (CYBERCUBE test-domain emails only). */
export const APPROVER_DIRECTORY: ApproverDirectoryEntry[] = [
  { id: "dir-1", name: "Alex Morgan", role: "Security reviewer", email: "alex.morgan@test.cybercube.software" },
  { id: "dir-2", name: "Sam Rivera", role: "Compliance analyst", email: "sam.rivera@test.cybercube.software" },
  { id: "dir-3", name: "Riley Brooks", role: "Engineering lead", email: "riley.brooks@test.cybercube.software" },
  { id: "dir-4", name: "Casey Ng", role: "Product counsel", email: "casey.ng@test.cybercube.software" },
  { id: "dir-5", name: "Morgan Patel", role: "SRE", email: "morgan.patel@test.cybercube.software" },
  { id: "dir-6", name: "Jamie Ortiz", role: "Program manager", email: "jamie.ortiz@test.cybercube.software" },
  { id: "dir-7", name: "Drew Kim", role: "Staff engineer", email: "drew.kim@test.cybercube.software" },
  { id: "dir-8", name: "Quinn Foster", role: "Risk officer", email: "quinn.foster@test.cybercube.software" },
];

export function searchApproverDirectory(query: string): ApproverDirectoryEntry[] {
  const q = query.trim().toLowerCase();
  const pool = q
    ? APPROVER_DIRECTORY.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q),
      )
    : APPROVER_DIRECTORY;
  return pool.slice(0, 12);
}
