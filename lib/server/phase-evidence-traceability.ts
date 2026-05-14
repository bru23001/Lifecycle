import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { projectDisplayCode } from "@/lib/server/helpers";
import { getCurrentUserDisplay } from "@/lib/server/current-user";
import { clampWorkspacePhase } from "@/lib/workspacePhases";
import { getAllTemplates } from "@/templates/registry";
import { evidenceLinkedToPhase } from "@/lib/evidence-phase-links";
import type { CoverageStatus } from "@/types/traceability.types";
import type {
  PhaseEvidenceLinkedItem,
  PhaseEvidenceMissingRow,
  PhaseEvidencePhaseDetailData,
  PhaseEvidenceTraceabilityListData,
  PhaseEvidenceTraceListRow,
} from "@/types/phase-evidence-traceability.types";

const PHASE_NAMES: Record<number, string> = {
  1: "Idea capture & charter",
  2: "Problem definition",
  3: "Evaluation & selection",
  4: "Feasibility detail",
  5: "Business case & stakeholders",
  6: "Requirements baseline",
  7: "Scope & planning control",
  8: "Architecture & design",
  9: "Development preparation",
  10: "Build planning & contracts",
  11: "Implementation readiness",
  12: "Build & integrate",
  13: "Verification & release",
  14: "Deploy & operate",
};

function coverageFromRatio(linked: number, total: number): { percent: number; status: CoverageStatus } {
  if (total <= 0) return { percent: 100, status: "complete" };
  const percent = Math.min(100, Math.round((100 * linked) / total));
  if (linked >= total) return { percent, status: "complete" };
  if (linked <= 0) return { percent, status: "missing" };
  return { percent, status: "partial" };
}

export function phaseCompletionImpact(
  phaseNumber: number,
  projectCurrentPhase: number,
  missingCount: number,
  requiredEvidence: number,
): string {
  if (missingCount <= 0) {
    return "Coverage meets template-derived targets for this lifecycle phase.";
  }
  if (phaseNumber > projectCurrentPhase) {
    return `Phase ${phaseNumber} is beyond the project cursor (phase ${projectCurrentPhase}); preload evidence so readiness keeps pace as work advances.`;
  }
  return `${missingCount} evidence slot${missingCount === 1 ? "" : "s"} open of ${requiredEvidence} template-derived requirements — low density weakens traceability and downstream gate narratives.`;
}

export function phaseChecklistImpact(missingCount: number): string {
  if (missingCount <= 0) {
    return "Workspace checklist items for this phase should reflect evidence-backed progress.";
  }
  return "Workspace checklist completion for this phase may lag until evidence coverage improves.";
}

export function normalizePhaseEvidenceRouteParam(phaseId: string): number | null {
  const raw = phaseId.trim().toLowerCase();
  const m = /^phase-(\d{1,2})$/.exec(raw) ?? /^(\d{1,2})$/.exec(raw);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  if (!Number.isFinite(n) || n < 1 || n > 14) return null;
  return n;
}

async function loadPhaseEvidenceContext(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      slug: true,
      vaultFolder: true,
      currentPhase: true,
      evidenceItems: {
        select: {
          id: true,
          evidenceCode: true,
          name: true,
          evidenceType: true,
          completenessPercent: true,
          phaseNumber: true,
          phaseLinks: { select: { phaseNumber: true } },
        },
      },
    },
  });
  if (!project) notFound();

  const user = await getCurrentUserDisplay();
  const currentPhase = clampWorkspacePhase(project.currentPhase);

  return { project, user, currentPhase };
}

export async function loadPhaseEvidenceTraceabilityList(projectId: string): Promise<PhaseEvidenceTraceabilityListData> {
  const ctx = await loadPhaseEvidenceContext(projectId);
  const { project, user, currentPhase } = ctx;
  const allT = getAllTemplates();

  const phases: PhaseEvidenceTraceListRow[] = Array.from({ length: 14 }, (_, i) => {
    const phaseNumber = i + 1;
    const templatesForPhase = allT.filter((t) => t.phase === phaseNumber);
    const requiredEvidence = Math.max(templatesForPhase.length, 1);
    const evidenceLinked = project.evidenceItems.filter((e) => evidenceLinkedToPhase(e, phaseNumber)).length;
    const missingCount = Math.max(0, requiredEvidence - evidenceLinked);
    const { percent, status } = coverageFromRatio(
      requiredEvidence > 0 ? Math.min(evidenceLinked, requiredEvidence) : evidenceLinked,
      requiredEvidence,
    );
    const phaseName = PHASE_NAMES[phaseNumber] ?? `Phase ${phaseNumber}`;
    const phaseIdParam = `phase-${phaseNumber}`;

    return {
      phaseNumber,
      phaseName,
      phaseIdParam,
      evidenceLinked,
      requiredEvidence,
      missingCount,
      coveragePercent: requiredEvidence > 0 ? percent : evidenceLinked > 0 ? 100 : 0,
      linkStatus: requiredEvidence > 0 ? status : evidenceLinked > 0 ? "complete" : "missing",
      completionImpact: phaseCompletionImpact(phaseNumber, currentPhase, missingCount, requiredEvidence),
      detailHref: `/projects/${project.id}/traceability/phase-evidence/${phaseIdParam}`,
      workspaceHref: `/projects/${project.id}/workspace?phase=${phaseNumber}`,
      addEvidenceHref: `/projects/${project.id}/evidence`,
    };
  });

  return {
    user: { name: user.name, role: user.role, initials: user.initials },
    project: {
      id: project.id,
      code: projectDisplayCode(project.vaultFolder, project.slug),
      name: project.name,
      currentPhase,
    },
    matrixHref: `/projects/${project.id}/traceability`,
    phases,
  };
}

export async function loadPhaseEvidencePhaseDetail(
  projectId: string,
  phaseIdParam: string,
): Promise<PhaseEvidencePhaseDetailData> {
  const phaseNumber = normalizePhaseEvidenceRouteParam(phaseIdParam);
  if (phaseNumber == null) notFound();

  const ctx = await loadPhaseEvidenceContext(projectId);
  const { project, user, currentPhase } = ctx;
  const allT = getAllTemplates();
  const templatesForPhase = allT.filter((t) => t.phase === phaseNumber);
  const requiredEvidence = Math.max(templatesForPhase.length, 1);
  const linkedRaw = project.evidenceItems.filter((e) => evidenceLinkedToPhase(e, phaseNumber));
  const evidenceLinked = linkedRaw.length;
  const missingCount = Math.max(0, requiredEvidence - evidenceLinked);
  const { percent, status } = coverageFromRatio(
    requiredEvidence > 0 ? Math.min(evidenceLinked, requiredEvidence) : evidenceLinked,
    requiredEvidence,
  );
  const phaseName = PHASE_NAMES[phaseNumber] ?? `Phase ${phaseNumber}`;

  const missingEvidence: PhaseEvidenceMissingRow[] = [];
  const labels = templatesForPhase.map((t) => t.title);
  for (let i = 0; i < missingCount; i++) {
    missingEvidence.push({
      id: `missing-${i}`,
      label: labels[i] ?? `Template-aligned evidence slot ${i + 1}`,
    });
  }

  const linkedEvidence: PhaseEvidenceLinkedItem[] = linkedRaw.map((e) => ({
    id: e.id,
    evidenceCode: e.evidenceCode,
    name: e.name,
    evidenceType: e.evidenceType,
    completenessPercent: e.completenessPercent,
    phaseNumber: e.phaseNumber ?? phaseNumber,
    detailHref: `/projects/${project.id}/evidence/${e.id}`,
  }));

  return {
    user: { name: user.name, role: user.role, initials: user.initials },
    project: {
      id: project.id,
      code: projectDisplayCode(project.vaultFolder, project.slug),
      name: project.name,
      currentPhase,
    },
    matrixHref: `/projects/${project.id}/traceability`,
    listHref: `/projects/${project.id}/traceability/phase-evidence`,
    completenessHref: `/projects/${project.id}/evidence/completeness`,
    phase: {
      phaseNumber,
      phaseName,
      requiredEvidence,
      evidenceLinked,
      missingCount,
      coveragePercent: requiredEvidence > 0 ? percent : evidenceLinked > 0 ? 100 : 0,
      linkStatus: requiredEvidence > 0 ? status : evidenceLinked > 0 ? "complete" : "missing",
      completionImpact: phaseCompletionImpact(phaseNumber, currentPhase, missingCount, requiredEvidence),
      checklistImpact: phaseChecklistImpact(missingCount),
    },
    linkedEvidence,
    missingEvidence,
    workspaceHref: `/projects/${project.id}/workspace?phase=${phaseNumber}`,
    addEvidenceHref: `/projects/${project.id}/evidence`,
  };
}
