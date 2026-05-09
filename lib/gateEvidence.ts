import { prisma } from "@/lib/prisma";

function templatesForGate(gate: string): string[] {
  switch (gate) {
    case "G1":
      return ["A-0"];
    case "G2":
      return ["A-0.1"];
    case "G3":
      return ["A-3.1", "A-3.2", "A-3.3", "A-4"];
    case "G4":
    case "G5":
    case "G6":
      return [];
    default:
      return [];
  }
}

/** Latest artifact body per template for a project (by `createdAt`). */
export async function loadGateEvidenceBundle(
  projectId: string,
  gate: string,
): Promise<Partial<Record<string, unknown>>> {
  const needed = templatesForGate(gate);

  const bundle: Partial<Record<string, unknown>> = {};

  await Promise.all(
    needed.map(async (templateId) => {
      const row = await prisma.artifact.findFirst({
        where: { projectId, templateId },
        orderBy: { createdAt: "desc" },
      });
      if (row) {
        bundle[templateId] = row.dataJson as unknown;
      }
    }),
  );

  return bundle;
}
