import type { PhaseNavItem } from "@/components/lifecycle-workspace/phase-navigator-types";
import { WORKSPACE_PHASES } from "@/lib/workspacePhases";

/** Title-case phase names for compact navigator labels. */
function navPhaseName(fullTitle: string): string {
  return fullTitle.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function buildPhaseNavigatorItems(args: {
  projectId: string;
  activeWorkspacePhase: number;
  /** True when the active phase row should show blocked styling (e.g. validation severity). */
  activeBlocked: boolean;
  /** True when templates for the active phase view are all complete. */
  activeReadyForReview: boolean;
}): PhaseNavItem[] {
  const { projectId, activeWorkspacePhase, activeBlocked, activeReadyForReview } = args;

  return WORKSPACE_PHASES.map((meta) => {
    const n = meta.index;
    let status: PhaseNavItem["status"];
    if (n < activeWorkspacePhase) {
      status = "completed";
    } else if (n > activeWorkspacePhase) {
      status = "not_started";
    } else if (activeBlocked) {
      status = "blocked";
    } else if (activeReadyForReview) {
      status = "ready_for_review";
    } else {
      status = "current";
    }

    const item: PhaseNavItem = {
      phaseNumber: n,
      name: navPhaseName(meta.title),
      status,
      href: `/projects/${projectId}/workspace?phase=${n}`,
    };

    if (meta.gate) {
      item.gateCode = meta.gate;
    }

    return item;
  });
}
