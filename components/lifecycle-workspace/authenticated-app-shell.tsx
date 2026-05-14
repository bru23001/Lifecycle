"use client";

import { useCallback, useMemo, useState } from "react";

import { AppShellLayoutContext } from "@/components/lifecycle-workspace/app-shell-layout-context";
import { AppSidebar, type AppSidebarActive } from "@/components/lifecycle-workspace/app-sidebar";
import { cn } from "@/lib/utils";

/** @deprecated Use `Breadcrumbs` from `@/components/lifecycle-workspace/breadcrumbs` */
export { Breadcrumbs as WorkspaceBreadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";

export function AuthenticatedAppShell(props: {
  /**
   * Current project context. Pass `null` (or omit) on global pages such as
   * Settings or Approval Center where there is no active project — the
   * sidebar will fall back to safe global links.
   */
  projectId?: string | null;
  /** Optional. Used for the "Continue Working" sidebar card; only shown when projectId is set. */
  projectName?: string;
  /** Optional. Caption rendered under the project name in the sidebar card. */
  phaseSummary?: string;
  /** Optional. 0–100 progress meter for the sidebar card. */
  phaseProgressPct?: number;
  /** Highlight current sidebar section. */
  navActive?: AppSidebarActive;
  /** Optional destination for the Gates nav item (defaults from phase via `nextOpenGateForPhase`). */
  gatesHref?: string;
  /** Workspace phase 1–14 for default Gates link when `gatesHref` is omitted. */
  projectCurrentPhase?: number | null;
  /**
   * Optional workspace phase index (1–14) for sidebar shortcuts (Artifacts, Evidence,
   * Traceability) `?phase=` — defaults to `projectCurrentPhase` when omitted.
   */
  navPhaseScope?: number | null;
  /**
   * When set, the sidebar "Continue Working" CTA uses this href (e.g. next approval,
   * template form, or workspace anchor) instead of the default workspace URL.
   */
  continueWorkingHref?: string | null;
  workspaceHref?: string;
  children: React.ReactNode;
}) {
  const {
    projectId = null,
    projectName,
    phaseSummary,
    phaseProgressPct,
    navActive = "lifecycle",
    gatesHref,
    projectCurrentPhase,
    navPhaseScope,
    continueWorkingHref,
    workspaceHref,
    children,
  } = props;
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = useCallback(() => {
    setCollapsed((c) => !c);
  }, []);

  const layoutValue = useMemo(
    () => ({
      sidebarCollapsed: collapsed,
      toggleSidebar,
    }),
    [collapsed, toggleSidebar],
  );

  return (
    <AppShellLayoutContext.Provider value={layoutValue}>
      <div
        className={cn(
          "app-shell max-h-dvh min-h-0",
          collapsed ? "app-shell--collapsed" : null,
        )}
      >
        <AppSidebar
          active={navActive}
          projectId={projectId}
          projectName={projectName}
          phaseSummary={phaseSummary}
          phaseProgressPct={phaseProgressPct}
          workspaceHref={workspaceHref}
          gatesHref={gatesHref}
          projectCurrentPhase={projectCurrentPhase}
          navPhaseScope={navPhaseScope}
          continueWorkingHref={continueWorkingHref ?? undefined}
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          className="sticky top-0 h-dvh min-h-0 max-h-dvh min-w-0"
        />

        <div className="main-area min-h-0 overflow-hidden">{children}</div>
      </div>
    </AppShellLayoutContext.Provider>
  );
}
