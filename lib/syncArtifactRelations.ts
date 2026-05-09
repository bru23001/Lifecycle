import { prisma } from "@/lib/prisma";
import { allocateNextLocalId } from "@/lib/localIds";

/** Resolve requirement DB id by project + localId label */
async function requirementIdByLocalId(
  projectId: string,
  localId: string,
): Promise<string | null> {
  const row = await prisma.requirement.findUnique({
    where: {
      projectId_localId: { projectId, localId: localId.trim() },
    },
    select: { id: true },
  });
  return row?.id ?? null;
}

export async function syncArtifactRelations(
  projectId: string,
  templateId: string,
  data: Record<string, unknown>,
): Promise<void> {
  switch (templateId) {
    case "A-1":
      await syncCrs(projectId, data);
      return;
    case "A-2":
      await syncSrs(projectId, data);
      return;
    case "A-10":
      await syncNfr(projectId, data);
      return;
    case "A-9":
      await syncFeatures(projectId, data);
      return;
    default:
      return;
  }
}

type CrsRow = {
  localId?: string;
  title: string;
  description?: string;
};

async function syncCrs(projectId: string, data: Record<string, unknown>): Promise<void> {
  const rows = (data.crsRows as CrsRow[] | undefined) ?? [];
  const oldCrs = await prisma.requirement.findMany({
    where: { projectId, kind: "CRS" },
    select: { id: true },
  });
  const oldIds = oldCrs.map((o) => o.id);
  if (oldIds.length > 0) {
    await prisma.traceLink.deleteMany({
      where: {
        projectId,
        OR: [{ fromId: { in: oldIds } }, { toId: { in: oldIds } }],
      },
    });
  }
  await prisma.requirement.deleteMany({
    where: { projectId, kind: "CRS" },
  });
  for (const row of rows) {
    const localId =
      row.localId?.trim() ||
      (await allocateNextLocalId(projectId, "CRS"));
    await prisma.requirement.create({
      data: {
        projectId,
        localId,
        kind: "CRS",
        title: row.title,
        body: row.description ?? "",
        status: "Baselined",
      },
    });
  }
}

type SrsRow = {
  localId?: string;
  kind: "SRS_FR" | "SRS_NFR";
  title: string;
  body?: string;
  verificationMethod?: string;
  parentCrsIds?: string;
};

async function syncSrs(projectId: string, data: Record<string, unknown>): Promise<void> {
  const rows = (data.srsRows as SrsRow[] | undefined) ?? [];
  const srsOldIds = (
    await prisma.requirement.findMany({
      where: { projectId, kind: { in: ["SRS_FR", "SRS_NFR"] } },
      select: { id: true },
    })
  ).map((r) => r.id);
  if (srsOldIds.length > 0) {
    await prisma.traceLink.deleteMany({
      where: {
        projectId,
        fromKind: "requirement",
        fromId: { in: srsOldIds },
      },
    });
  }
  await prisma.requirement.deleteMany({
    where: {
      projectId,
      kind: { in: ["SRS_FR", "SRS_NFR"] },
    },
  });

  for (const row of rows) {
    const prefix = row.kind === "SRS_FR" ? "SRS-FR" : "SRS-NFR";
    const dbKind = row.kind;
    const localId =
      row.localId?.trim() ||
      (await allocateNextLocalId(projectId, prefix));
    const created = await prisma.requirement.create({
      data: {
        projectId,
        localId,
        kind: dbKind,
        title: row.title,
        body: row.body ?? "",
        verificationMethod: row.verificationMethod ?? "",
        status: "Baselined",
      },
    });
    const parents =
      row.parentCrsIds
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) ?? [];
    for (const crsLabel of parents) {
      const crsId = await requirementIdByLocalId(projectId, crsLabel);
      if (!crsId) continue;
      await prisma.traceLink.create({
        data: {
          projectId,
          fromKind: "requirement",
          fromId: created.id,
          toKind: "requirement",
          toId: crsId,
          relation: "derives",
        },
      });
    }
  }
}

type NfrRow = {
  localId?: string;
  dimension?: string;
  title: string;
  body?: string;
  verificationMethod?: string;
};

async function syncNfr(projectId: string, data: Record<string, unknown>): Promise<void> {
  const rows = (data.nfrRows as NfrRow[] | undefined) ?? [];
  const oldNfr = await prisma.requirement.findMany({
    where: { projectId, kind: "NFR" },
    select: { id: true },
  });
  const nfrIds = oldNfr.map((o) => o.id);
  if (nfrIds.length > 0) {
    await prisma.traceLink.deleteMany({
      where: {
        projectId,
        OR: [{ fromId: { in: nfrIds } }, { toId: { in: nfrIds } }],
      },
    });
  }
  await prisma.requirement.deleteMany({
    where: { projectId, kind: "NFR" },
  });
  for (const row of rows) {
    const localId =
      row.localId?.trim() ||
      (await allocateNextLocalId(projectId, "NFR"));
    await prisma.requirement.create({
      data: {
        projectId,
        localId,
        kind: "NFR",
        title:
          row.dimension?.trim()
            ? `${row.dimension.trim()} — ${row.title.trim()}`
            : row.title.trim(),
        body: row.body ?? "",
        verificationMethod: row.verificationMethod ?? "",
        status: "Baselined",
      },
    });
  }
}

type FeatRow = {
  localId?: string;
  title: string;
  description?: string;
  priority?: string;
  linkedRequirementIds?: string;
};

async function syncFeatures(projectId: string, data: Record<string, unknown>): Promise<void> {
  const rows = (data.featureRows as FeatRow[] | undefined) ?? [];
  await prisma.traceLink.deleteMany({
    where: {
      projectId,
      fromKind: "feature",
    },
  });
  await prisma.feature.deleteMany({ where: { projectId } });

  for (const row of rows) {
    const localId =
      row.localId?.trim() ||
      (await allocateNextLocalId(projectId, "FEAT"));
    const created = await prisma.feature.create({
      data: {
        projectId,
        localId,
        title: row.title,
        description: row.description ?? "",
        priority: row.priority ?? "",
        status: "Baselined",
      },
    });
    const links =
      row.linkedRequirementIds
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) ?? [];
    for (const reqLabel of links) {
      const rid = await requirementIdByLocalId(projectId, reqLabel);
      if (!rid) continue;
      await prisma.traceLink.create({
        data: {
          projectId,
          fromKind: "feature",
          fromId: created.id,
          toKind: "requirement",
          toId: rid,
          relation: "implements",
        },
      });
    }
  }
}
