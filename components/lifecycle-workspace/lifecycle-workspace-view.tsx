import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import type { PhaseNavItem } from "@/components/lifecycle-workspace/phase-navigator-types";
import type { PhaseHeaderData } from "@/components/lifecycle-workspace/phase-header-types";
import { PhaseNavigator } from "@/components/lifecycle-workspace/phase-navigator";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { CurrentPhaseMainPanel } from "@/components/lifecycle-workspace/current-phase-main-panel";
import { NextRequiredActionBar } from "@/components/lifecycle-workspace/next-required-action-bar";
import type { NextRequiredAction } from "@/components/lifecycle-workspace/next-required-action-types";
import { PhaseHeader } from "@/components/lifecycle-workspace/phase-header";
import { ReviewStatusPanel } from "@/components/lifecycle-workspace/review-status-panel";
import type { CompletionChecklistItem } from "@/components/lifecycle-workspace/completion-checklist-types";
import type { EvidenceAttachment } from "@/components/lifecycle-workspace/evidence-attachments-types";
import type { CurrentPhaseWorkspaceData } from "./current-phase-workspace-types";
import type { RequiredTemplate } from "./required-templates-types";
import type { ValidationWarning } from "./validation-warnings-types";
import type { GateSubmissionState } from "./submit-gate-review-types";

export function LifecycleWorkspaceView({
  projectId,
  projectName,
  phaseSummary,
  phaseProgressPct,
  breadcrumbCode,
  phaseHeader,
  phaseNavigatorItems,
  workspace,
  requiredTemplates,
  evidenceAttachments,
  checklistItems,
  validationWarnings,
  gateSubmissionState,
  nextRequiredAction,
}: {
  projectId: string;
  projectName: string;
  phaseSummary: string;
  phaseProgressPct: number;
  breadcrumbCode: string;
  phaseHeader: PhaseHeaderData;
  phaseNavigatorItems: PhaseNavItem[];
  workspace: CurrentPhaseWorkspaceData;
  requiredTemplates: RequiredTemplate[];
  evidenceAttachments: EvidenceAttachment[];
  checklistItems: CompletionChecklistItem[];
  validationWarnings: ValidationWarning[];
  gateSubmissionState: GateSubmissionState;
  nextRequiredAction: NextRequiredAction;
}) {
  return (
    <AuthenticatedAppShell
      projectId={projectId}
      projectName={projectName}
      phaseSummary={phaseSummary}
      phaseProgressPct={phaseProgressPct}
    >
      <TopHeader title="Lifecycle Workspace" />
      <div className="flex min-h-0 flex-1 flex-col bg-[#f8fafc] dark:bg-background">
        <div
          role="region"
          aria-label="Lifecycle workspace"
          id="lifecycle-workspace"
          className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-24"
        >
          <div className="mx-auto w-full max-w-[1920px] px-5 pt-4">
            <Breadcrumbs
              items={[
                { label: "Projects", href: "/projects" },
                {
                  label: `${projectName} (${breadcrumbCode})`,
                  href: `/projects/${projectId}`,
                },
                { label: "Lifecycle Workspace" },
              ]}
            />

            <div className="mt-4">
              <PhaseHeader data={phaseHeader} />
            </div>
          </div>

          <div className="lifecycle-workspace mx-auto w-full max-w-[1920px]">
            <PhaseNavigator items={phaseNavigatorItems} projectId={projectId} />
            <CurrentPhaseMainPanel
              workspace={workspace}
              requiredTemplates={requiredTemplates}
              evidenceAttachments={evidenceAttachments}
            />
            <ReviewStatusPanel
              checklistItems={checklistItems}
              validationWarnings={validationWarnings}
              gateSubmissionState={gateSubmissionState}
            />
          </div>
        </div>

        <NextRequiredActionBar
          label={nextRequiredAction.label}
          description={nextRequiredAction.description}
          ctaLabel={nextRequiredAction.ctaLabel}
          href={nextRequiredAction.href}
        />
      </div>
    </AuthenticatedAppShell>
  );
}
