import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { buildEntityLabelMaps, summarizeRequirementTraceParts } from "@/lib/registerTraceLabels";
import { projectDisplayCode } from "@/lib/server/helpers";
import { getCurrentUserDisplay } from "@/lib/server/current-user";
import { clampWorkspacePhase } from "@/lib/workspacePhases";
import type { CoverageStatus, RequirementKind } from "@/types/traceability.types";
import type {
  RequirementDesignLinkedFeature,
  RequirementDesignTraceRow,
  RequirementDesignTraceabilityData,
  RequirementDesignTypeSummary,
} from "@/types/requirement-design-traceability.types";

const REQUIREMENT_BUCKET_ORDER: RequirementKind[] = [
  "business",
  "functional",
  "non_functional",
  "interface",
  "data",
];

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

function coverageFromRatio(linked: number, total: number): { percent: number; status: CoverageStatus } {
  if (total <= 0) return { percent: 100, status: "complete" };
  const percent = Math.min(100, Math.round((100 * linked) / total));
  if (linked >= total) return { percent, status: "complete" };
  if (linked <= 0) return { percent, status: "missing" };
  return { percent, status: "partial" };
}

const TYPE_QUERY_VALUES = new Set<string>(REQUIREMENT_BUCKET_ORDER);

export function parseRequirementDesignTypeParam(raw: string | undefined): RequirementKind | null {
  if (!raw || !TYPE_QUERY_VALUES.has(raw)) return null;
  return raw as RequirementKind;
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

function linkedFeaturesForRequirement(
  projectId: string,
  reqId: string,
  links: { id: string; fromKind: string; fromId: string; toKind: string; toId: string; relation: string }[],
  featById: Map<string, { id: string; localId: string; title: string }>,
): RequirementDesignLinkedFeature[] {
  const out: RequirementDesignLinkedFeature[] = [];
  for (const l of links) {
    if (l.fromKind === "feature" && l.toKind === "requirement" && l.toId === reqId && l.relation === "implements") {
      const f = featById.get(l.fromId);
      if (f) {
        out.push({
          id: f.id,
          localId: f.localId,
          title: f.title,
          traceLinkId: l.id,
          relation: l.relation,
          href: `/projects/${projectId}/traceability/${l.id}`,
        });
      }
    }
  }
  return out;
}

export async function loadRequirementDesignTraceability(
  projectId: string,
  typeParam?: string | null,
): Promise<RequirementDesignTraceabilityData> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true, slug: true, vaultFolder: true, currentPhase: true },
  });
  if (!project) notFound();

  const [user, requirements, features, links] = await Promise.all([
    getCurrentUserDisplay(),
    prisma.requirement.findMany({
      where: { projectId },
      orderBy: [{ kind: "asc" }, { localId: "asc" }],
    }),
    prisma.feature.findMany({
      where: { projectId },
      select: { id: true, localId: true, title: true },
    }),
    prisma.traceLink.findMany({
      where: { projectId, deletedAt: null },
      select: { id: true, fromKind: true, fromId: true, toKind: true, toId: true, relation: true },
    }),
  ]);

  const featById = new Map(features.map((f) => [f.id, f]));
  const maps = buildEntityLabelMaps({
    requirementRows: requirements.map((r) => ({ id: r.id, localId: r.localId })),
    featureRows: features.map((f) => ({ id: f.id, localId: f.localId })),
  });

  const reqsByKind = new Map<RequirementKind, typeof requirements>();
  for (const k of REQUIREMENT_BUCKET_ORDER) reqsByKind.set(k, []);
  for (const r of requirements) {
    const rk = dbKindToRequirementKind(r.kind);
    if (rk) reqsByKind.get(rk)!.push(r);
  }

  const typeSummaries: RequirementDesignTypeSummary[] = REQUIREMENT_BUCKET_ORDER.map((kind) => {
    const bucket = reqsByKind.get(kind) ?? [];
    const requirementsTotal = bucket.length;
    const designLinksTotal = bucket.filter((r) => hasDesignTrace(r.id, links)).length;
    const { percent, status } = coverageFromRatio(designLinksTotal, requirementsTotal);
    return {
      requirementType: kind,
      label: REQUIREMENT_BUCKET_LABEL[kind],
      requirementsTotal,
      designLinksTotal,
      coveragePercent: percent,
      status,
      href: `/projects/${project.id}/traceability/requirements-design?type=${kind}`,
    };
  });

  const selectedType = parseRequirementDesignTypeParam(typeParam ?? undefined);
  const inScope = requirements.filter((r) => {
    const rk = dbKindToRequirementKind(r.kind);
    if (!rk) return false;
    if (selectedType && rk !== selectedType) return false;
    return true;
  });

  const traceRows: RequirementDesignTraceRow[] = inScope.map((r) => {
    const rk = dbKindToRequirementKind(r.kind)!;
    const has = hasDesignTrace(r.id, links);
    const linked = linkedFeaturesForRequirement(project.id, r.id, links, featById);
    const rationaleLines = summarizeRequirementTraceParts({
      requirementId: r.id,
      links,
      maps,
      maxParts: 6,
    });
    return {
      id: r.id,
      localId: r.localId,
      title: r.title,
      requirementType: rk,
      requirementTypeLabel: REQUIREMENT_BUCKET_LABEL[rk],
      hasDesignLink: has,
      rowStatus: has ? ("complete" as const) : ("missing" as const),
      linkedFeatures: linked,
      rationaleLines,
      linkOwnerLabel: null,
      detailHref: `/projects/${project.id}/requirements/${r.id}`,
    };
  });

  return {
    user: { name: user.name, role: user.role, initials: user.initials },
    project: {
      id: project.id,
      code: projectDisplayCode(project.vaultFolder, project.slug),
      name: project.name,
      currentPhase: clampWorkspacePhase(project.currentPhase),
    },
    matrixHref: `/projects/${project.id}/traceability`,
    requirementsRegisterHref: `/projects/${project.id}/requirements`,
    selectedType,
    typeSummaries,
    requirements: traceRows,
  };
}
