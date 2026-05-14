import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  buildEntityLabelMaps,
  labelTraceEndpoint,
  summarizeRequirementTraceParts,
} from "@/lib/registerTraceLabels";
import { projectDisplayCode } from "@/lib/server/helpers";
import { getCurrentUserDisplay } from "@/lib/server/current-user";
import { parseRequirementDesignTypeParam } from "@/lib/server/requirement-design-traceability";
import { clampWorkspacePhase } from "@/lib/workspacePhases";
import type { CoverageStatus, RequirementKind } from "@/types/traceability.types";
import type {
  RequirementTestLinkedTrace,
  RequirementTestTraceRow,
  RequirementTestTraceabilityData,
  RequirementTestTypeSummary,
} from "@/types/requirement-test-traceability.types";

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

const TEST_TRACE_RELATIONS = new Set(["tests", "validates"]);

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

function hasVerificationText(req: { verificationMethod?: string | null }): boolean {
  return Boolean(req.verificationMethod?.trim());
}

function linkedTestTracesForRequirement(
  projectId: string,
  reqId: string,
  links: { id: string; fromKind: string; fromId: string; toKind: string; toId: string; relation: string }[],
  maps: ReturnType<typeof buildEntityLabelMaps>,
): RequirementTestLinkedTrace[] {
  const out: RequirementTestLinkedTrace[] = [];
  for (const l of links) {
    if (!TEST_TRACE_RELATIONS.has(l.relation)) continue;
    if (l.fromKind === "requirement" && l.fromId === reqId) {
      out.push({
        traceLinkId: l.id,
        relation: l.relation,
        endpointSummary: labelTraceEndpoint(l.toKind, l.toId, maps),
        href: `/projects/${projectId}/tests/${l.id}`,
      });
    } else if (l.toKind === "requirement" && l.toId === reqId) {
      out.push({
        traceLinkId: l.id,
        relation: l.relation,
        endpointSummary: labelTraceEndpoint(l.fromKind, l.fromId, maps),
        href: `/projects/${projectId}/tests/${l.id}`,
      });
    }
  }
  return out;
}

/** Exported for matrix row counts (verification text or tests/validates trace). */
export function requirementHasTestCoverage(
  req: { id: string; verificationMethod?: string | null },
  links: { fromKind: string; fromId: string; toKind: string; toId: string; relation: string }[],
): boolean {
  if (hasVerificationText(req)) return true;
  for (const l of links) {
    if (!TEST_TRACE_RELATIONS.has(l.relation)) continue;
    if (l.fromKind === "requirement" && l.fromId === req.id) return true;
    if (l.toKind === "requirement" && l.toId === req.id) return true;
  }
  return false;
}

export async function loadRequirementTestTraceability(
  projectId: string,
  typeParam?: string | null,
): Promise<RequirementTestTraceabilityData> {
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

  const typeSummaries: RequirementTestTypeSummary[] = REQUIREMENT_BUCKET_ORDER.map((kind) => {
    const bucket = reqsByKind.get(kind) ?? [];
    const requirementsTotal = bucket.length;
    const testCoverageTotal = bucket.filter((r) => requirementHasTestCoverage(r, links)).length;
    const { percent, status } = coverageFromRatio(testCoverageTotal, requirementsTotal);
    return {
      requirementType: kind,
      label: REQUIREMENT_BUCKET_LABEL[kind],
      requirementsTotal,
      testCoverageTotal,
      coveragePercent: percent,
      status,
      href: `/projects/${project.id}/traceability/requirements-tests?type=${kind}`,
    };
  });

  const selectedType = parseRequirementDesignTypeParam(typeParam ?? undefined);
  const inScope = requirements.filter((r) => {
    const rk = dbKindToRequirementKind(r.kind);
    if (!rk) return false;
    if (selectedType && rk !== selectedType) return false;
    return true;
  });

  const traceRows: RequirementTestTraceRow[] = inScope.map((r) => {
    const rk = dbKindToRequirementKind(r.kind)!;
    const hasText = hasVerificationText(r);
    const linked = linkedTestTracesForRequirement(project.id, r.id, links, maps);
    const covered = hasText || linked.length > 0;
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
      verificationMethod: r.verificationMethod?.trim() ? r.verificationMethod : null,
      linkedTestTraces: linked,
      rowStatus: covered ? "complete" : "missing",
      rationaleLines,
      linkOwnerLabel: null,
      executionStatusLabel: "Not tracked in workspace",
      defectsLabel: "—",
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
