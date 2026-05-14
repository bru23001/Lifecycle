import type { EvidenceCenterData } from "@/types/evidence-center.types";
import type {
  EvidenceValidationResult,
  ValidationIssue,
  ValidationIssueCategory,
  ValidationIssueSeverity,
} from "@/types/evidence-validation.types";

function sevRank(s: ValidationIssueSeverity): number {
  if (s === "fail") return 2;
  if (s === "warn") return 1;
  return 0;
}

function push(
  issues: ValidationIssue[],
  id: string,
  severity: ValidationIssueSeverity,
  category: ValidationIssueCategory,
  title: string,
  detail: string,
  args: {
    evidenceId?: string;
    evidenceCode?: string;
    evidenceHref?: string;
    fixHref?: string;
    fixLabel: string;
    remediationHint: string;
  },
) {
  issues.push({
    id,
    severity,
    category,
    title,
    detail,
    evidenceId: args.evidenceId,
    evidenceCode: args.evidenceCode,
    evidenceHref: args.evidenceHref,
    fixHref: args.fixHref,
    fixLabel: args.fixLabel,
    remediationHint: args.remediationHint,
  });
}

/**
 * Client-safe validation snapshot from Evidence Center payload (no DB).
 */
export function runEvidenceValidation(data: EvidenceCenterData): EvidenceValidationResult {
  const issues: ValidationIssue[] = [];

  for (const item of data.evidenceItems) {
    if (item.status === "archived") continue;

    if (!item.name?.trim()) {
      push(
        issues,
        `meta-name-${item.id}`,
        "fail",
        "metadata",
        "Missing evidence name",
        `${item.evidenceCode} has an empty display name.`,
        {
          evidenceId: item.id,
          evidenceCode: item.evidenceCode,
          evidenceHref: item.href,
          fixHref: item.href,
          fixLabel: "Open evidence",
          remediationHint: "Edit metadata and provide a clear, auditable title.",
        },
      );
    }

    if (item.status === "unlinked") {
      push(
        issues,
        `link-unlinked-${item.id}`,
        "fail",
        "links",
        "Evidence not placed on lifecycle map",
        `${item.evidenceCode} is unlinked — no phase/gate context for reviewers.`,
        {
          evidenceId: item.id,
          evidenceCode: item.evidenceCode,
          evidenceHref: item.href,
          fixHref: item.href,
          fixLabel: "Link phase / gate",
          remediationHint: "Open the evidence record and link phase, gate, and artifacts as applicable.",
        },
      );
    } else if (item.status === "partially_linked") {
      push(
        issues,
        `link-partial-${item.id}`,
        "warn",
        "links",
        "Partial linkage",
        `${item.evidenceCode} is only partially linked (phase, gate, or artifacts incomplete).`,
        {
          evidenceId: item.id,
          evidenceCode: item.evidenceCode,
          evidenceHref: item.href,
          fixHref: item.href,
          fixLabel: "Complete linkage",
          remediationHint: "Finish artifact and gate links to reach “linked” status.",
        },
      );
    }

    if (item.classification === "restricted" && item.linkedArtifactIds.length === 0) {
      push(
        issues,
        `class-restricted-${item.id}`,
        "warn",
        "classification",
        "Restricted evidence without artifact anchors",
        `${item.evidenceCode} is restricted-class; artifact linkage strengthens custody narrative.`,
        {
          evidenceId: item.id,
          evidenceCode: item.evidenceCode,
          evidenceHref: item.href,
          fixHref: item.href,
          fixLabel: "Link artifacts",
          remediationHint: "Attach supporting artifacts or document an approved exception.",
        },
      );
    }
  }

  for (const g of data.evidenceByGate) {
    if (g.status === "missing" || g.status === "not_started") {
      push(
        issues,
        `gate-${g.gateId}`,
        "warn",
        "gate_readiness",
        `Gate ${g.gateCode} evidence gap`,
        `${g.gateName}: ${g.evidenceLinked}/${g.requiredEvidence} evidence rows vs template-derived requirement (${g.coveragePercent}% coverage).`,
        {
          fixHref: g.href,
          fixLabel: "Gate review",
          remediationHint: "Add or map evidence to this gate before gate review submission.",
        },
      );
    } else if (g.status === "partial") {
      push(
        issues,
        `gate-partial-${g.gateId}`,
        "info",
        "gate_readiness",
        `Gate ${g.gateCode} partial coverage`,
        `${g.gateName} is partially covered (${g.coveragePercent}%).`,
        {
          fixHref: g.href,
          fixLabel: "Review gate evidence",
          remediationHint: "Close remaining template slots or record justified gaps.",
        },
      );
    }
  }

  for (const p of data.evidenceByPhase) {
    if (p.status === "missing" || p.status === "not_started") {
      push(
        issues,
        `phase-${p.phaseId}`,
        "warn",
        "phase_completion",
        `Phase ${p.phaseNumber} evidence gap`,
        `${p.phaseName}: ${p.evidenceItems}/${p.requiredEvidence} evidence rows (${p.coveragePercent}% coverage).`,
        {
          fixHref: p.detailHref,
          fixLabel: "Phase evidence detail",
          remediationHint: "Align evidence density with templates for this phase.",
        },
      );
    }
  }

  const fail = issues.filter((i) => i.severity === "fail").length;
  const warn = issues.filter((i) => i.severity === "warn").length;
  const info = issues.filter((i) => i.severity === "info").length;
  const evidenceRowsScanned = data.evidenceItems.filter((e) => e.status !== "archived").length;

  issues.sort((a, b) => sevRank(b.severity) - sevRank(a.severity) || a.category.localeCompare(b.category));

  const weakGates = data.evidenceByGate.filter((g) => g.status === "missing" || g.status === "partial").length;
  const weakPhases = data.evidenceByPhase.filter((p) => p.status === "missing" || p.status === "partial").length;

  return {
    generatedAtIso: new Date().toISOString(),
    summary: { fail, warn, info, evidenceRowsScanned },
    issues,
    gateReadinessImpact:
      weakGates > 0
        ? `${weakGates} gate${weakGates === 1 ? "" : "s"} show incomplete evidence coverage — gate decisions may be delayed or conditioned until slots close.`
        : "Gate-level evidence coverage meets configured template targets.",
    phaseCompletionImpact:
      weakPhases > 0
        ? `${weakPhases} lifecycle phase${weakPhases === 1 ? "" : "s"} trail template-derived evidence counts — phase narratives and audits read weaker downstream.`
        : "Phase-level evidence density aligns with template expectations.",
  };
}

export function issuesForCategory(
  issues: ValidationIssue[],
  category: ValidationIssueCategory,
): ValidationIssue[] {
  return issues.filter((i) => i.category === category);
}
