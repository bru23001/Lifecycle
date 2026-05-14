import type { PhaseNavItem } from "@/components/lifecycle-workspace/phase-navigator-types";
import { WORKSPACE_PHASES } from "@/lib/workspacePhases";

/** Title-case phase names for compact navigator labels. */
function navPhaseName(fullTitle: string): string {
  return fullTitle.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function buildPhaseNavigatorItems(args: {
  projectId: string;
  /** DB-backed lifecycle milestone (1–14). */
  projectCurrentPhase: number;
  /** Selected workspace phase from the URL (`?phase=`), defaults to project phase. */
  selectedWorkspacePhase: number;
  /** Validation severity on the project’s current phase row. */
  projectPhaseBlocked: boolean;
  /** All required templates complete for the project’s current phase. */
  projectPhaseReadyForReview: boolean;
}): PhaseNavItem[] {
  const {
    projectId,
    projectCurrentPhase,
    selectedWorkspacePhase,
    projectPhaseBlocked,
    projectPhaseReadyForReview,
  } = args;

  return WORKSPACE_PHASES.map((meta) => {
    const n = meta.index;
    let status: PhaseNavItem["status"];
    if (n > projectCurrentPhase) {
      status = "locked";
    } else if (n < projectCurrentPhase) {
      status = "completed";
    } else if (projectPhaseBlocked) {
      status = "blocked";
    } else if (projectPhaseReadyForReview) {
      status = "ready_for_review";
    } else {
      status = "current";
    }

    const item: PhaseNavItem = {
      phaseNumber: n,
      name: navPhaseName(meta.title),
      status,
      href:
        status === "locked"
          ? "#"
          : `/projects/${projectId}/workspace?phase=${n}`,
      isSelected: n === selectedWorkspacePhase,
    };

    if (meta.gate) {
      item.gateCode = meta.gate;
    }

    return item;
  });
}
