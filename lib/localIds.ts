import { prisma } from "@/lib/prisma";

export type RequirementKindPrefix = "CRS" | "SRS-FR" | "SRS-NFR" | "NFR" | "FEAT";

const PREFIX_TO_REGEX: Record<RequirementKindPrefix, RegExp> = {
  CRS: /^CRS-(\d+)$/i,
  "SRS-FR": /^SRS-FR-(\d+)$/i,
  "SRS-NFR": /^SRS-NFR-(\d+)$/i,
  NFR: /^NFR-(\d+)$/i,
  FEAT: /^FEAT-(\d+)$/i,
};

function maxNumFromLocalIds(
  localIds: string[],
  prefix: RequirementKindPrefix,
): number {
  const re = PREFIX_TO_REGEX[prefix];
  let max = 0;
  for (const id of localIds) {
    const m = id.trim().match(re);
    if (m) {
      const n = Number.parseInt(m[1]!, 10);
      if (Number.isFinite(n) && n > max) max = n;
    }
  }
  return max;
}

/**
 * Next stable local id for a project (e.g. `CRS-003`).
 * Uses existing Requirement / Feature rows for the project.
 */
export async function allocateNextLocalId(
  projectId: string,
  prefix: RequirementKindPrefix,
): Promise<string> {
  if (prefix === "FEAT") {
    const rows = await prisma.feature.findMany({
      where: { projectId },
      select: { localId: true },
    });
    const next =
      maxNumFromLocalIds(
        rows.map((r) => r.localId),
        "FEAT",
      ) + 1;
    return `FEAT-${String(next).padStart(3, "0")}`;
  }

  const dbKind =
    prefix === "CRS"
      ? "CRS"
      : prefix === "NFR"
        ? "NFR"
        : prefix === "SRS-FR"
          ? "SRS_FR"
          : prefix === "SRS-NFR"
            ? "SRS_NFR"
            : "CRS";

  const rows = await prisma.requirement.findMany({
    where: { projectId, kind: dbKind },
    select: { localId: true },
  });

  const next =
    maxNumFromLocalIds(
      rows.map((r) => r.localId),
      prefix,
    ) + 1;
  const padded = String(next).padStart(3, "0");
  switch (prefix) {
    case "CRS":
      return `CRS-${padded}`;
    case "SRS-FR":
      return `SRS-FR-${padded}`;
    case "SRS-NFR":
      return `SRS-NFR-${padded}`;
    case "NFR":
      return `NFR-${padded}`;
    default: {
      const _e: never = prefix;
      return _e;
    }
  }
}
