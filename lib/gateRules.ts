/**
 * Decision gate evidence checks for G1–G10.
 *
 * Canonical rules: `Master Lifecycle/21. Decision Gates.md` §5 (Gate Catalog).
 */

import { prisma } from "@/lib/prisma";
import { mergeApplicabilityRecords, parseApplicability } from "@/lib/applicability";
import { loadGateEvidenceBundle } from "@/lib/gateEvidence";
import type { G3StructuredWaiver } from "@/lib/waiver";
import { parseStructuredG3Waiver } from "@/lib/waiver";
import { getTemplate } from "@/templates/registry";

export type GateId =
  | "G1"
  | "G2"
  | "G3"
  | "G4"
  | "G5"
  | "G6"
  | "G7"
  | "G8"
  | "G9"
  | "G10";

/** Evidence payloads keyed by template id (subset loaded per gate). */
export type GateEvidenceBundle = Partial<Record<string, unknown>>;

export type GateEvidenceCheck = {
  /** Stable id for UI / tests */
  id: string;
  ok: boolean;
  message: string;
  /** Template this check primarily refers to */
  templateId?: string;
};

export type GateEvaluationResult = {
  gateId: GateId;
  pass: boolean;
  checks: GateEvidenceCheck[];
};

const DOC_REF = "Master Lifecycle/21. Decision Gates.md §5";

function pushCheck(
  checks: GateEvidenceCheck[],
  check: GateEvidenceCheck,
): void {
  checks.push(check);
}

function isBlankish(s: string): boolean {
  return s.trim().length === 0;
}

function isNoneLike(s: string): boolean {
  return /^(none|n\/a|na|\.)$/i.test(s.trim());
}

/** G1 — Idea Accepted for Analysis: A-0 complete and approved (plan: all sections + Approved). */
export function evaluateG1(evidence: GateEvidenceBundle): GateEvaluationResult {
  const checks: GateEvidenceCheck[] = [];
  const gateId: GateId = "G1";

  const template = getTemplate("A-0");
  const parsed = template.schema.safeParse(evidence["A-0"]);

  if (!parsed.success) {
    pushCheck(checks, {
      id: "g1.a0.schema",
      ok: false,
      templateId: "A-0",
      message: `Idea Capture (A-0) must be valid per template schema (${DOC_REF} — G1 required evidence). ${parsed.error.issues[0]?.message ?? "Validation failed."}`,
    });
    return { gateId, pass: false, checks };
  }

  const data = parsed.data as Record<string, unknown>;
  const approval = data.approvalStatus;
  const approved = approval === "Approved";
  pushCheck(checks, {
    id: "g1.a0.approval",
    ok: approved,
    templateId: "A-0",
    message: approved
      ? "A-0 approval status is Approved."
      : `A-0 must be Approved for G1 (current: ${String(approval)}). Per ${DOC_REF} — G1.`,
  });

  const sectionCount = template.sections.length;
  const expectedSections = 16;
  const sectionShapeOk = sectionCount === expectedSections;
  pushCheck(checks, {
    id: "g1.a0.sections",
    ok: sectionShapeOk,
    templateId: "A-0",
    message: sectionShapeOk
      ? `A-0 includes ${sectionCount} sections (Phase 1 §9 / plan: ${expectedSections} sections).`
      : `A-0 template is expected to expose ${expectedSections} sections for G1 completeness; found ${sectionCount}.`,
  });

  const pass = checks.every((c) => c.ok);
  return { gateId, pass, checks };
}

/** G2 — Problem Validated: A-0.1 approved + independent validation source (§5). */
export function evaluateG2(evidence: GateEvidenceBundle): GateEvaluationResult {
  const checks: GateEvidenceCheck[] = [];
  const gateId: GateId = "G2";

  const template = getTemplate("A-0.1");
  const parsed = template.schema.safeParse(evidence["A-0.1"]);

  if (!parsed.success) {
    pushCheck(checks, {
      id: "g2.a01.schema",
      ok: false,
      templateId: "A-0.1",
      message: `Problem Definition (A-0.1) must be valid per template schema (${DOC_REF} — G2). ${parsed.error.issues[0]?.message ?? "Validation failed."}`,
    });
    return { gateId, pass: false, checks };
  }

  const data = parsed.data as Record<string, unknown>;
  const approval = data.approvalStatus;
  const approved = approval === "Approved";
  pushCheck(checks, {
    id: "g2.a01.approval",
    ok: approved,
    templateId: "A-0.1",
    message: approved
      ? "A-0.1 approval status is Approved."
      : `A-0.1 must be Approved for G2 (current: ${String(approval)}). Per ${DOC_REF} — G2.`,
  });

  const ivs = String(data.independentValidationSource ?? "").trim();
  const hasIndependentSource = ivs.length >= 5 && !isNoneLike(ivs);
  pushCheck(checks, {
    id: "g2.a01.independent_validation",
    ok: hasIndependentSource,
    templateId: "A-0.1",
    message: hasIndependentSource
      ? "At least one independent validation source is recorded (§5 G2)."
      : "G2 requires an independent validation source in A-0.1 (Problem Definition) per §5.",
  });

  const pass = checks.every((c) => c.ok);
  return { gateId, pass, checks };
}

const G3_SCORECARD_APPROVED = "Approved" as const;
const G3_FEASIBILITY_APPROVED = new Set([
  "Feasible — Proceed to Requirements",
  "Conditionally Feasible — Proceed to Requirements",
]);
const G3_BUSINESS_PROCEED = new Set([
  "Proceed to Requirements",
  "Proceed to Requirements with Conditions",
]);

const A3_2_RATING_KEYS = [
  "technicalFeasibilityRating",
  "resourceFeasibilityRating",
  "scheduleFeasibilityRating",
  "financialFeasibilityRating",
  "operationalFeasibilityRating",
  "securityComplianceFeasibilityRating",
  "integrationFeasibilityRating",
  "maintenanceFeasibilityRating",
] as const;

function parseTemplate(templateId: keyof GateEvidenceBundle, raw: unknown) {
  const template = getTemplate(templateId);
  return template.schema.safeParse(raw);
}

function hasApprovedA4(parsed: {
  success: boolean;
  data?: unknown;
}): boolean {
  if (!parsed.success) return false;
  const d = parsed.data as Record<string, unknown>;
  return d.documentStatus === "Approved";
}

/**
 * §5 G3: A-4 **or** approved waiver. Waiver is evidenced on A-3.1 when no approved A-4 exists.
 */
function hasApprovedWaiverOnScorecard(data: Record<string, unknown>): boolean {
  const related = String(data.relatedBusinessFieldReport ?? "").trim();
  const waivers = String(data.waiversIfAny ?? "").trim();
  if (waivers.length < 10 || isNoneLike(waivers)) return false;
  const rel = related.toLowerCase();
  const wav = waivers.toLowerCase();
  return (
    rel.includes("waiver") ||
    wav.includes("waiver") ||
    wav.includes("approved waiver") ||
    (wav.includes("approved") && wav.includes("field"))
  );
}

function g3UnknownComplexityPlanOk(data: Record<string, unknown>): boolean {
  let anyUnknown = false;
  for (const key of A3_2_RATING_KEYS) {
    if (data[key] === "Unknown") anyUnknown = true;
  }
  if (!anyUnknown) {
    return true;
  }
  const research = String(data.requiredResearch ?? "").trim();
  const questions = String(data.openQuestions ?? "").trim();
  const planOk =
    (research.length >= 5 && !isNoneLike(research)) ||
    (questions.length >= 5 && !isNoneLike(questions));
  return planOk;
}

function g3PrcsMetadataOk(data: Record<string, unknown>): boolean {
  const pcl = String(data.prcsPclCode ?? "").trim();
  const prodId = String(data.prcsCandidateApprovedProductId ?? "").trim();
  const rationale = String(data.prcsNonApplicabilityRationale ?? "").trim();

  const pclNa = /^n\/?a$/i.test(pcl);
  const prodNa = /^n\/?a$/i.test(prodId);
  if (pclNa && prodNa) {
    return rationale.length >= 10;
  }
  return (
    !isBlankish(String(data.prcsDomainTags ?? "")) &&
    !isBlankish(String(data.prcsFunctionDescriptors ?? "")) &&
    !isBlankish(String(data.prcsWorkTypeTags ?? ""))
  );
}

function hasStructuredG3Waiver(waiver: G3StructuredWaiver | null | undefined): boolean {
  return waiver != null && waiver.rationale.trim().length >= 10;
}

/** G3 — Project Selected: A-3.1, A-3.2, A-3.3, A-4 or waiver, complexity / Unknown plan, PRCS metadata (§5). */
export function evaluateG3(
  evidence: GateEvidenceBundle,
  structuredWaiver?: G3StructuredWaiver | null,
): GateEvaluationResult {
  const checks: GateEvidenceCheck[] = [];
  const gateId: GateId = "G3";

  const parsed31 = parseTemplate("A-3.1", evidence["A-3.1"]);
  if (!parsed31.success) {
    pushCheck(checks, {
      id: "g3.a31.schema",
      ok: false,
      templateId: "A-3.1",
      message: `Project Selection Scorecard (A-3.1) invalid. ${parsed31.error.issues[0]?.message ?? ""} (${DOC_REF} — G3).`,
    });
    return { gateId, pass: false, checks };
  }
  const a31 = parsed31.data as Record<string, unknown>;
  const scorecardApproved = a31.documentStatus === G3_SCORECARD_APPROVED;
  pushCheck(checks, {
    id: "g3.a31.approved",
    ok: scorecardApproved,
    templateId: "A-3.1",
    message: scorecardApproved
      ? "A-3.1 document status is Approved."
      : `A-3.1 must be Approved for G3 (current: ${String(a31.documentStatus)}).`,
  });

  const parsed32 = parseTemplate("A-3.2", evidence["A-3.2"]);
  if (!parsed32.success) {
    pushCheck(checks, {
      id: "g3.a32.schema",
      ok: false,
      templateId: "A-3.2",
      message: `Feasibility Assessment (A-3.2) invalid. ${parsed32.error.issues[0]?.message ?? ""} (${DOC_REF} — G3).`,
    });
  } else {
    const a32 = parsed32.data as Record<string, unknown>;
    const status = String(a32.feasibilityApprovalStatus ?? "");
    const feasOk = G3_FEASIBILITY_APPROVED.has(status);
    pushCheck(checks, {
      id: "g3.a32.approval",
      ok: feasOk,
      templateId: "A-3.2",
      message: feasOk
        ? "A-3.2 feasibility approval indicates proceed to requirements."
        : `A-3.2 must record a proceed decision (Feasible / Conditionally Feasible — Proceed to Requirements). Current: ${status || "—"}.`,
    });

    const unknownPlan = g3UnknownComplexityPlanOk(a32);
    pushCheck(checks, {
      id: "g3.a32.complexity_unknown_plan",
      ok: unknownPlan,
      templateId: "A-3.2",
      message: unknownPlan
        ? "Complexity / feasibility ratings: no Unknown without a resolution path, or Unknown resolution captured (§5 G3 + Project Complexity Levels)."
        : "When any feasibility area is Unknown, document an explicit resolution path (Required Research and/or Open Questions) per §5 G3.",
    });
  }

  const parsed33 = parseTemplate("A-3.3", evidence["A-3.3"]);
  if (!parsed33.success) {
    pushCheck(checks, {
      id: "g3.a33.schema",
      ok: false,
      templateId: "A-3.3",
      message: `Business Case (A-3.3) invalid. ${parsed33.error.issues[0]?.message ?? ""} (${DOC_REF} — G3).`,
    });
  } else {
    const a33 = parsed33.data as Record<string, unknown>;
    const rec = String(a33.businessRecommendation ?? "");
    const recOk = G3_BUSINESS_PROCEED.has(rec);
    pushCheck(checks, {
      id: "g3.a33.funding_signal",
      ok: recOk,
      templateId: "A-3.3",
      message: recOk
        ? "Business case recommendation supports proceeding (funding signal)."
        : `Business case recommendation must support proceed-to-requirements for G3 (current: ${rec || "—"}).`,
    });

    const prcsOk = g3PrcsMetadataOk(a33);
    pushCheck(checks, {
      id: "g3.a33.prcs_metadata",
      ok: prcsOk,
      templateId: "A-3.3",
      message: prcsOk
        ? "PRCS candidate metadata or non-applicability rationale is documented (§5 G3)."
        : "G3 requires PRCS candidate metadata (PCL, domain tags, descriptors, work-type tags) or a substantive non-applicability rationale when IDs are N/A.",
    });
  }

  const parsed4 = parseTemplate("A-4", evidence["A-4"]);
  const a4Approved = hasApprovedA4(parsed4);
  const structuredWaiverOk = hasStructuredG3Waiver(structuredWaiver);
  const legacyWaiverOk = hasApprovedWaiverOnScorecard(a31);
  const waiverOk = structuredWaiverOk || legacyWaiverOk;
  const businessFieldOk = a4Approved || waiverOk;
  pushCheck(checks, {
    id: "g3.a4_or_waiver",
    ok: businessFieldOk,
    templateId: a4Approved ? "A-4" : structuredWaiverOk ? "waiverGranted" : "A-3.1",
    message: businessFieldOk
      ? a4Approved
        ? "Business Field Report (A-4) is present and Approved."
        : structuredWaiverOk
          ? "Approved waiver for Business Field Report (A-4) is recorded in project applicability (waiverGranted)."
          : "Approved waiver for Business Field Report (A-4) is documented on A-3.1."
      : "G3 requires Template A-4 (Approved), a structured waiver in applicabilityJson.waiverGranted, or legacy waiver text on A-3.1.",
  });

  const pass = checks.every((c) => c.ok);
  return { gateId, pass, checks };
}

/**
 * Evaluate a single gate. Supply only the artifacts that gate needs; missing keys fail parse checks.
 */
export function evaluateGate(
  gateId: GateId,
  evidence: GateEvidenceBundle,
): GateEvaluationResult {
  switch (gateId) {
    case "G1":
      return evaluateG1(evidence);
    case "G2":
      return evaluateG2(evidence);
    case "G3":
      return evaluateG3(evidence);
    case "G4":
    case "G5":
    case "G6":
    case "G7":
    case "G8":
    case "G9":
    case "G10":
      throw new Error(
        `${gateId} requires database-backed evaluation — use evaluateGateForProject(projectId, gateId).`,
      );
    default: {
      const _e: never = gateId;
      return _e;
    }
  }
}

function isApprovedArtifactBody(data: unknown): boolean {
  const d = data as Record<string, unknown>;
  const status = d.documentStatus ?? d.approvalStatus;
  return status === "Approved";
}

async function latestArtifact(projectId: string, templateId: string) {
  return prisma.artifact.findFirst({
    where: { projectId, templateId },
    orderBy: { createdAt: "desc" },
  });
}

async function evaluateG4Project(projectId: string): Promise<GateEvaluationResult> {
  const checks: GateEvidenceCheck[] = [];
  const gateId: GateId = "G4";

  const requiredTemplates = ["A-8", "A-1", "A-2", "A-10"] as const;

  for (const tid of requiredTemplates) {
    const art = await latestArtifact(projectId, tid);
    const ok = Boolean(art && isApprovedArtifactBody(art.dataJson));
    pushCheck(checks, {
      id: `g4.${tid}.approved`,
      ok,
      templateId: tid,
      message: ok
        ? `${tid} is present and Approved.`
        : `G4 requires ${tid} with document/approval status Approved.`,
    });
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  const complexityOk = Boolean(project?.complexityLevel?.trim());
  pushCheck(checks, {
    id: "g4.complexity",
    ok: complexityOk,
    message: complexityOk
      ? `Complexity level recorded: ${project!.complexityLevel}`
      : "Set project complexity level (confirmed for G4).",
  });

  const srsRows = await prisma.requirement.findMany({
    where: { projectId, kind: "SRS_FR" },
  });
  for (const srs of srsRows) {
    const n = await prisma.traceLink.count({
      where: {
        projectId,
        fromKind: "requirement",
        fromId: srs.id,
        relation: { in: ["informs", "derives"] },
        toKind: { in: ["requirement", "feature"] },
      },
    });
    const ok = n > 0;
    pushCheck(checks, {
      id: `g4.trace.srs.${srs.localId}`,
      ok,
      message: ok
        ? `${srs.localId} has informs/derives trace link(s).`
        : `${srs.localId} must trace via informs/derives to CRS or Feature evidence.`,
    });
  }

  const feats = await prisma.feature.findMany({ where: { projectId } });
  for (const f of feats) {
    const n = await prisma.traceLink.count({
      where: { projectId, fromKind: "feature", fromId: f.id },
    });
    const ok = n > 0;
    pushCheck(checks, {
      id: `g4.trace.feat.${f.localId}`,
      ok,
      message: ok
        ? `${f.localId} links to requirement evidence.`
        : `${f.localId} must link to at least one requirement.`,
    });
  }

  const pass = checks.every((c) => c.ok);
  return { gateId, pass, checks };
}

async function evaluateG5Project(projectId: string): Promise<GateEvaluationResult> {
  const checks: GateEvidenceCheck[] = [];
  const gateId: GateId = "G5";

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { applicabilityJson: true },
  });
  const records = await prisma.applicabilityRecord.findMany({ where: { projectId } });
  const app = mergeApplicabilityRecords(
    parseApplicability(project?.applicabilityJson ?? {}),
    records,
  );

  const ard = await latestArtifact(projectId, "ARD-001");
  const ardOk = Boolean(ard && isApprovedArtifactBody(ard.dataJson));
  pushCheck(checks, {
    id: "g5.ard001.approved",
    ok: ardOk,
    templateId: "ARD-001",
    message: ardOk
      ? "ARD-001 is Approved."
      : "G5 requires ARD-001 Approved.",
  });

  const ardData = (ard?.dataJson ?? {}) as Record<string, unknown>;
  const deviations = String(ardData.deviationsNotes ?? "").trim();
  const adrRows = Array.isArray(ardData.adrRows) ? ardData.adrRows : [];
  const deviationOk = deviations.length === 0 || adrRows.length > 0;
  pushCheck(checks, {
    id: "g5.ard.deviations_vs_adrs",
    ok: deviationOk,
    templateId: "ARD-001",
    message: deviationOk
      ? "ADR coverage matches deviations notes (or no deviations recorded)."
      : "Record deviations in ARD requires at least one embedded ADR row.",
  });

  if (app.data) {
    const erd = await latestArtifact(projectId, "A-11");
    const ok = Boolean(erd && isApprovedArtifactBody(erd.dataJson));
    pushCheck(checks, {
      id: "g5.a11.when_data",
      ok,
      templateId: "A-11",
      message: ok
        ? "A-11 ERD Approved (data applicability on)."
        : "Applicability:data requires Template A-11 Approved.",
    });
  }

  if (app.apis) {
    const api = await latestArtifact(projectId, "A-12");
    const ok = Boolean(api && isApprovedArtifactBody(api.dataJson));
    pushCheck(checks, {
      id: "g5.a12.when_apis",
      ok,
      templateId: "A-12",
      message: ok
        ? "A-12 API contract Approved (apis applicability on)."
        : "Applicability:apis requires Template A-12 Approved.",
    });
  }

  if (app.ui) {
    const uxd = await latestArtifact(projectId, "UXD-001");
    const ok = Boolean(uxd && isApprovedArtifactBody(uxd.dataJson));
    pushCheck(checks, {
      id: "g5.uxd.when_ui",
      ok,
      templateId: "UXD-001",
      message: ok
        ? "UXD-001 Approved (ui applicability on)."
        : "Applicability:ui requires UXD-001 Approved.",
    });
  }

  const pass = checks.every((c) => c.ok);
  return { gateId, pass, checks };
}

async function evaluateG6Project(projectId: string): Promise<GateEvaluationResult> {
  const checks: GateEvidenceCheck[] = [];
  const gateId: GateId = "G6";

  const templates = ["A-14", "A-13", "A-15"] as const;
  for (const tid of templates) {
    const art = await latestArtifact(projectId, tid);
    const ok = Boolean(art && isApprovedArtifactBody(art.dataJson));
    pushCheck(checks, {
      id: `g6.${tid}.approved`,
      ok,
      templateId: tid,
      message: ok ? `${tid} Approved.` : `G6 requires ${tid} Approved.`,
    });
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  const namingOk = Boolean(project?.namingConformanceNote?.trim());
  pushCheck(checks, {
    id: "g6.naming",
    ok: namingOk,
    message: namingOk
      ? "Naming / identifier conformance captured."
      : "Record naming conformance notes on the project (STD-ENG-001 context).",
  });

  const testOk = Boolean(project?.initialTestSetupNote?.trim());
  pushCheck(checks, {
    id: "g6.test_setup",
    ok: testOk,
    message: testOk
      ? "Initial test setup captured."
      : "Record initial test setup notes on the project.",
  });

  const pass = checks.every((c) => c.ok);
  return { gateId, pass, checks };
}

async function evaluateG7Project(projectId: string): Promise<GateEvaluationResult> {
  const checks: GateEvidenceCheck[] = [];
  const gateId: GateId = "G7";

  const templates = ["A-16", "A-17", "A-18", "A-19", "A-20"] as const;
  for (const tid of templates) {
    const art = await latestArtifact(projectId, tid);
    const ok = Boolean(art && isApprovedArtifactBody(art.dataJson));
    pushCheck(checks, {
      id: `g7.${tid}.approved`,
      ok,
      templateId: tid,
      message: ok
        ? `${tid} Approved (G7 testing evidence).`
        : `G7 requires ${tid} Approved per Decision Gates §5 (Testing Passed).`,
    });
  }

  const pass = checks.every((c) => c.ok);
  return { gateId, pass, checks };
}

async function evaluateG8Project(projectId: string): Promise<GateEvaluationResult> {
  const checks: GateEvidenceCheck[] = [];
  const gateId: GateId = "G8";

  const g8Templates = ["A-21", "A-22", "A-23", "A-24", "A-25", "A-26"] as const;
  for (const tid of g8Templates) {
    const art = await latestArtifact(projectId, tid);
    const ok = Boolean(art && isApprovedArtifactBody(art.dataJson));
    pushCheck(checks, {
      id: `g8.${tid}.approved`,
      ok,
      templateId: tid,
      message: ok
        ? `${tid} Approved (release gate evidence).`
        : `G8 requires Template ${tid} Approved.`,
    });
  }

  const pass = checks.every((c) => c.ok);
  return { gateId, pass, checks };
}

async function evaluateG9Project(projectId: string): Promise<GateEvaluationResult> {
  const checks: GateEvidenceCheck[] = [];
  const gateId: GateId = "G9";

  const g9Templates = ["A-27", "A-28", "A-29", "A-30", "A-31"] as const;
  for (const tid of g9Templates) {
    const art = await latestArtifact(projectId, tid);
    const ok = Boolean(art && isApprovedArtifactBody(art.dataJson));
    pushCheck(checks, {
      id: `g9.${tid}.approved`,
      ok,
      templateId: tid,
      message: ok
        ? `${tid} Approved (deployment gate evidence).`
        : `G9 requires Template ${tid} Approved.`,
    });
  }

  const pass = checks.every((c) => c.ok);
  return { gateId, pass, checks };
}

async function evaluateG10Project(projectId: string): Promise<GateEvaluationResult> {
  const checks: GateEvidenceCheck[] = [];
  const gateId: GateId = "G10";

  const g10Templates = ["A-38", "A-35", "A-39", "A-40", "A-41"] as const;
  for (const tid of g10Templates) {
    const art = await latestArtifact(projectId, tid);
    const ok = Boolean(art && isApprovedArtifactBody(art.dataJson));
    pushCheck(checks, {
      id: `g10.${tid}.approved`,
      ok,
      templateId: tid,
      message: ok
        ? `${tid} Approved (post-release gate evidence).`
        : `G10 requires Template ${tid} Approved.`,
    });
  }

  const pass = checks.every((c) => c.ok);
  return { gateId, pass, checks };
}

/**
 * Full gate evaluation including G4–G10 database checks (trace links, applicability).
 */
export async function evaluateGateForProject(
  projectId: string,
  gateId: GateId,
): Promise<GateEvaluationResult> {
  switch (gateId) {
    case "G1":
    case "G2":
    case "G3": {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { applicabilityJson: true },
      });
      const bundle = await loadGateEvidenceBundle(projectId, gateId);
      const structuredWaiver = parseStructuredG3Waiver(project?.applicabilityJson ?? {});
      return evaluateG3(bundle, structuredWaiver);
    }
    case "G4":
      return evaluateG4Project(projectId);
    case "G5":
      return evaluateG5Project(projectId);
    case "G6":
      return evaluateG6Project(projectId);
    case "G7":
      return evaluateG7Project(projectId);
    case "G8":
      return evaluateG8Project(projectId);
    case "G9":
      return evaluateG9Project(projectId);
    case "G10":
      return evaluateG10Project(projectId);
    default: {
      const _e: never = gateId;
      return _e;
    }
  }
}

/** Human-readable list of failing checks (for “On failure” UX). */
export function formatGateBlockingMessages(result: GateEvaluationResult): string[] {
  return result.checks.filter((c) => !c.ok).map((c) => c.message);
}
