import { prisma } from "@/lib/prisma";

/**
 * Hydrate relational templates from Requirement / Feature tables for wizard defaults.
 */
export async function loadTemplateDefaults(
  projectId: string,
  templateId: string,
): Promise<Record<string, unknown>> {
  switch (templateId) {
    case "A-1": {
      const rows = await prisma.requirement.findMany({
        where: { projectId, kind: "CRS" },
        orderBy: { localId: "asc" },
      });
      return {
        crsRows: rows.map((r) => ({
          localId: r.localId,
          title: r.title,
          description: r.body,
        })),
      };
    }
    case "A-2": {
      const rows = await prisma.requirement.findMany({
        where: {
          projectId,
          kind: { in: ["SRS_FR", "SRS_NFR"] },
        },
        orderBy: { localId: "asc" },
      });
      const links = await prisma.traceLink.findMany({
        where: { projectId, relation: "derives", fromKind: "requirement" },
      });
      const reqById = new Map(rows.map((r) => [r.id, r]));
      const crsLocals = new Map(
        (
          await prisma.requirement.findMany({
            where: { projectId, kind: "CRS" },
            select: { id: true, localId: true },
          })
        ).map((r) => [r.id, r.localId]),
      );

      const parentsBySrsId = new Map<string, string[]>();
      for (const l of links) {
        const srs = reqById.get(l.fromId);
        if (!srs) continue;
        const crsLabel = crsLocals.get(l.toId);
        if (!crsLabel) continue;
        const arr = parentsBySrsId.get(srs.id) ?? [];
        arr.push(crsLabel);
        parentsBySrsId.set(srs.id, arr);
      }

      return {
        srsRows: rows.map((r) => ({
          localId: r.localId,
          kind: r.kind as "SRS_FR" | "SRS_NFR",
          title: r.title,
          body: r.body,
          verificationMethod: r.verificationMethod ?? "",
          parentCrsIds: (parentsBySrsId.get(r.id) ?? []).join(", "),
        })),
      };
    }
    case "A-10": {
      const rows = await prisma.requirement.findMany({
        where: { projectId, kind: "NFR" },
        orderBy: { localId: "asc" },
      });
      return {
        nfrRows: rows.map((r) => ({
          // Stored format: "<dimension> — <title>"; split back for form hydration.
          ...(() => {
            const parts = r.title.split(" — ");
            if (parts.length >= 2) {
              const [dimension, ...rest] = parts;
              return {
                dimension: dimension ?? "Quality",
                title: rest.join(" — "),
              };
            }
            return {
              dimension: "Quality",
              title: r.title,
            };
          })(),
          localId: r.localId,
          body: r.body,
          verificationMethod: r.verificationMethod ?? "",
        })),
      };
    }
    case "A-9": {
      const feats = await prisma.feature.findMany({
        where: { projectId },
        orderBy: { localId: "asc" },
      });
      const links = await prisma.traceLink.findMany({
        where: { projectId, fromKind: "feature" },
      });
      const reqLocals = new Map(
        (
          await prisma.requirement.findMany({
            where: { projectId },
            select: { id: true, localId: true },
          })
        ).map((r) => [r.id, r.localId]),
      );
      const reqsByFeat = new Map<string, string[]>();
      for (const l of links) {
        const label = reqLocals.get(l.toId);
        if (!label) continue;
        const arr = reqsByFeat.get(l.fromId) ?? [];
        arr.push(label);
        reqsByFeat.set(l.fromId, arr);
      }
      return {
        featureRows: feats.map((f) => ({
          localId: f.localId,
          title: f.title,
          description: f.description,
          priority: f.priority ?? "Should",
          linkedRequirementIds: (reqsByFeat.get(f.id) ?? []).join(", "),
        })),
      };
    }
    default:
      return {};
  }
}
