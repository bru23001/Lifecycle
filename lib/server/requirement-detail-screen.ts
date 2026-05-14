import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { buildEntityLabelMaps, summarizeRequirementTraceParts } from "@/lib/registerTraceLabels";
import { projectDisplayCode } from "@/lib/server/helpers";
import { getCurrentUserDisplay } from "@/lib/server/current-user";
import { clampWorkspacePhase } from "@/lib/workspacePhases";
import type { CoverageStatus, RequirementKind } from "@/types/traceability.types";

const REQUIREMENT_BUCKET_LABEL: Record<RequirementKind, string> = {
  business: "Business Requirements",
  functional: "Functional Requirements",
  non_functional: "Non-Functional Requirements",
  interface: "Interface Requirements",
  data: "Data Requirements",
};

function dbKindToRequirementKind(kind: string): RequirementKind | null {
  if (kind === "CRS") return "business";
  if (kind === "SRS_FR") return "functional";
  if (kind === "SRS_NFR" || kind === "NFR") return "non_functional";
  return null;
}

function hasDesignTrace(
  reqId: string,
  links: { fromKind: string; fromId: string; toKind: string; toId: string; relation: string }[],
): boolean {
  return links.some(
    (l) =>
      (l.fromKind === "feature" && l.toKind === "requirement" && l.toId === reqId && l.relation === "implements") ||
      (l.fromKind === "requirement" &&
        l.toKind === "requirement" &&
        (l.fromId === reqId || l.toId === reqId) &&
        l.relation === "derives"),
  );
}

export type RequirementDetailScreenData = {
  user: { name: string; role: string; initials: string };
  project: { id: string; code: string; name: string; currentPhase: number };
  matrixHref: string;
  registerHref: string;
  featuresHref: string;
  requirement: {
    id: string;
    localId: string;
    title: string;
    kind: string;
    body: string;
    status: string;
    version: number;
    verificationMethod: string | null;
    createdAt: string;
    updatedAt: string;
  };
  requirementKindLabel: string;
  hasDesignLink: boolean;
  traceRowStatus: CoverageStatus;
  linkedFeatures: { id: string; localId: string; title: string; traceLinkId: string; href: string }[];
  rationaleLines: string[];
};

export async function loadRequirementDetailScreen(
  projectId: string,
  requirementId: string,
): Promise<RequirementDetailScreenData> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true, slug: true, vaultFolder: true, currentPhase: true },
  });
  if (!project) notFound();

  const [user, requirement, links, allRequirements, features] = await Promise.all([
    getCurrentUserDisplay(),
    prisma.requirement.findFirst({
      where: { id: requirementId, projectId },
    }),
    prisma.traceLink.findMany({
      where: { projectId, deletedAt: null },
      select: { id: true, fromKind: true, fromId: true, toKind: true, toId: true, relation: true },
    }),
    prisma.requirement.findMany({
      where: { projectId },
      select: { id: true, localId: true },
    }),
    prisma.feature.findMany({
      where: { projectId },
      select: { id: true, localId: true, title: true },
    }),
  ]);

  if (!requirement) notFound();

  const maps = buildEntityLabelMaps({
    requirementRows: allRequirements,
    featureRows: features.map((f) => ({ id: f.id, localId: f.localId })),
  });

  const featById = new Map(features.map((f) => [f.id, f]));
  const has = hasDesignTrace(requirement.id, links);
  const linkedFeatures: RequirementDetailScreenData["linkedFeatures"] = [];
  for (const l of links) {
    if (
      l.fromKind === "feature" &&
      l.toKind === "requirement" &&
      l.toId === requirement.id &&
      l.relation === "implements"
    ) {
      const f = featById.get(l.fromId);
      if (f) {
        linkedFeatures.push({
          id: f.id,
          localId: f.localId,
          title: f.title,
          traceLinkId: l.id,
          href: `/projects/${projectId}/traceability/${l.id}`,
        });
      }
    }
  }

  const rk = dbKindToRequirementKind(requirement.kind);
  const requirementKindLabel = rk ? REQUIREMENT_BUCKET_LABEL[rk] : requirement.kind;

  return {
    user: { name: user.name, role: user.role, initials: user.initials },
    project: {
      id: project.id,
      code: projectDisplayCode(project.vaultFolder, project.slug),
      name: project.name,
      currentPhase: clampWorkspacePhase(project.currentPhase),
    },
    matrixHref: `/projects/${project.id}/traceability`,
    registerHref: `/projects/${project.id}/requirements`,
    featuresHref: `/projects/${project.id}/features`,
    requirement: {
      id: requirement.id,
      localId: requirement.localId,
      title: requirement.title,
      kind: requirement.kind,
      body: requirement.body,
      status: requirement.status,
      version: requirement.version,
      verificationMethod: requirement.verificationMethod,
      createdAt: requirement.createdAt.toISOString(),
      updatedAt: requirement.updatedAt.toISOString(),
    },
    requirementKindLabel,
    hasDesignLink: has,
    traceRowStatus: has ? "complete" : "missing",
    linkedFeatures,
    rationaleLines: summarizeRequirementTraceParts({
      requirementId: requirement.id,
      links,
      maps,
      maxParts: 12,
    }),
  };
}
