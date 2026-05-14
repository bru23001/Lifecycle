"use client";

import { useState } from "react";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { PaneSwitcher } from "@/components/lifecycle-workspace/pane-switcher";
import type {
  PhaseNavItem,
  PhaseNavigatorMeta,
} from "@/components/lifecycle-workspace/phase-navigator-types";
import type { PhaseHeaderData } from "@/components/lifecycle-workspace/phase-header-types";
import { PhaseNavigator } from "@/components/lifecycle-workspace/phase-navigator";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { CurrentPhaseMainPanel } from "@/components/lifecycle-workspace/current-phase-main-panel";
import { WorkspaceActionBar } from "@/components/lifecycle-workspace/workspace-action-bar";
import type { NextRequiredAction } from "@/components/lifecycle-workspace/next-required-action-types";
import { ReviewStatusPanel } from "@/components/lifecycle-workspace/review-status-panel";
import type {
  CompletionChecklistItem,
  CompletionRulesPayload,
} from "@/components/lifecycle-workspace/completion-checklist-types";
import type {
  EvidenceAttachment,
  EvidenceWorkspaceContextPayload,
} from "@/components/lifecycle-workspace/evidence-attachments-types";
import type { CurrentPhaseWorkspaceData } from "./current-phase-workspace-types";
import type { RequiredTemplate } from "./required-templates-types";
import type { ValidationWarning } from "./validation-warnings-types";
import type { GateSubmissionState } from "./submit-gate-review-types";
import type { WorkspacePhaseActionsPayload } from "./workspace-phase-tools-types";
import { projectOverviewHref } from "@/lib/projects-url";
import { WorkspaceUnsavedChangesProvider } from "@/components/lifecycle-workspace/workspace-unsaved-context";

export function LifecycleWorkspaceView({
  projectId,
  projectName,
  phaseSummary,
  phaseProgressPct,
  projectCurrentPhase,
  statusPanelPhase,
  gatesHref,
  breadcrumbCode,
  userInitials,
  userName,
  userRole,
  phaseHeader,
  phaseNavigatorItems,
  phaseNavigatorMeta,
  workspace,
  requiredTemplates,
  evidenceAttachments,
  evidenceWorkspace,
  checklistItems,
  completionRules,
  validationWarnings,
  gateSubmissionState,
  nextRequiredAction,
  phaseExportZipBase,
  workspacePhaseActions,
}: {
  projectId: string;
  projectName: string;
  phaseSummary: string;
  phaseProgressPct: number;
  /** DB-backed navigator phase (shell / gates). */
  projectCurrentPhase: number;
  /** Phase index for status pane checklist (matches URL `phase` when present). */
  statusPanelPhase: number;
  /** Optional; default Gates nav uses DB-backed readiness when set. */
  gatesHref?: string;
  breadcrumbCode: string;
  userInitials: string;
  userName: string;
  userRole: string;
  phaseHeader: PhaseHeaderData;
  phaseNavigatorItems: PhaseNavItem[];
  phaseNavigatorMeta: PhaseNavigatorMeta;
  workspace: CurrentPhaseWorkspaceData;
  requiredTemplates: RequiredTemplate[];
  evidenceAttachments: EvidenceAttachment[];
  evidenceWorkspace: EvidenceWorkspaceContextPayload;
  checklistItems: CompletionChecklistItem[];
  completionRules: CompletionRulesPayload;
  validationWarnings: ValidationWarning[];
  gateSubmissionState: GateSubmissionState;
  nextRequiredAction: NextRequiredAction;
  /** JSON payload used by Export Phase Package (ZIP) from the workspace action bar. */
  phaseExportZipBase: Record<string, unknown>;
  workspacePhaseActions: WorkspacePhaseActionsPayload;
}) {
  const [mobilePane, setMobilePane] = useState<"phase" | "workspace" | "status">("workspace");

  return (
    <WorkspaceUnsavedChangesProvider>
    <AuthenticatedAppShell
      projectId={projectId}
      projectName={projectName}
      phaseSummary={phaseSummary}
      phaseProgressPct={phaseProgressPct}
      projectCurrentPhase={projectCurrentPhase}
      navPhaseScope={statusPanelPhase}
      workspaceHref={`/projects/${projectId}/workspace?phase=${statusPanelPhase}`}
      gatesHref={gatesHref}
    >
      <TopHeader
        title="Lifecycle Workspace"
        userInitials={userInitials}
        userName={userName}
        userRole={userRole}
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--app-bg)]">
        <div className="mx-auto w-full max-w-[1920px] shrink-0 px-5 pt-4">
          <Breadcrumbs
            items={[
              { label: "Projects", href: "/projects" },
              {
                label: `${projectName} (${breadcrumbCode})`,
                href: projectOverviewHref(projectId),
              },
              { label: "Lifecycle Workspace" },
            ]}
          />

        </div>

        <PaneSwitcher
          panes={[
            { id: "phase", label: "Phases" },
            { id: "workspace", label: "Workspace" },
            { id: "status", label: "Status" },
          ]}
          active={mobilePane}
          onChange={(id) => setMobilePane(id as typeof mobilePane)}
          className="mx-auto w-full max-w-[1920px]"
        />

        <div
          role="region"
          aria-label="Lifecycle workspace"
          id="lifecycle-workspace"
          data-active-pane={mobilePane}
          className="lifecycle-workspace mx-auto w-full max-w-[1920px]"
        >
          <PhaseNavigator
            items={phaseNavigatorItems}
            projectId={projectId}
            meta={phaseNavigatorMeta}
          />
          <CurrentPhaseMainPanel
            phaseHeader={phaseHeader}
            workspace={workspace}
            requiredTemplates={requiredTemplates}
            defaultArtifactOwnerName={userName}
            evidenceAttachments={evidenceAttachments}
            evidenceWorkspace={evidenceWorkspace}
            workspacePhaseActions={workspacePhaseActions}
          />
          <ReviewStatusPanel
            checklistItems={checklistItems}
            completionRules={completionRules}
            projectRecordId={projectId}
            phaseNumber={statusPanelPhase}
            validationWarnings={validationWarnings}
            gateSubmissionState={gateSubmissionState}
          />
        </div>

        <WorkspaceActionBar
          projectId={projectId}
          phaseNumber={statusPanelPhase}
          nextRequiredAction={nextRequiredAction}
          phaseExportZipBase={phaseExportZipBase}
        />
      </div>
    </AuthenticatedAppShell>
    </WorkspaceUnsavedChangesProvider>
  );
}
