import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

import type { CurrentPhaseWorkspaceData } from "@/components/lifecycle-workspace/current-phase-workspace-types";
import { PhaseHeaderBody } from "@/components/lifecycle-workspace/phase-header";
import type { PhaseHeaderData } from "@/components/lifecycle-workspace/phase-header-types";
import { WorkspacePhaseTools } from "@/components/lifecycle-workspace/workspace-phase-tools";
import type { WorkspacePhaseActionsPayload } from "@/components/lifecycle-workspace/workspace-phase-tools-types";

function InstructionText({ children }: { children: ReactNode }) {
  return (
    <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{children}</p>
  );
}

function InfoCallout({ children }: { children: ReactNode }) {
  return (
    <div
      className="mt-3 flex gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5 text-sm text-sky-950 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100"
      role="status"
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-sky-700 dark:text-sky-300" aria-hidden />
      <div className="min-w-0 leading-snug">{children}</div>
    </div>
  );
}

function PhaseObjectiveBlock({ objectives }: { objectives: string[] }) {
  if (objectives.length === 0) return null;
  return (
    <div className="phase-objective-block">
      <p className="text-xs font-semibold tracking-wide text-foreground">Key Objectives</p>
      <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[13px] text-foreground">
        {objectives.map((obj, i) => (
          <li key={i} className="leading-relaxed">
            {obj}
          </li>
        ))}
      </ul>
    </div>
  );
}

export type CurrentPhaseWorkspaceProps = {
  phaseHeader: PhaseHeaderData;
  data: CurrentPhaseWorkspaceData;
  workspacePhaseActions?: WorkspacePhaseActionsPayload;
};

export function CurrentPhaseWorkspace({
  phaseHeader,
  data,
  workspacePhaseActions,
}: CurrentPhaseWorkspaceProps) {
  return (
    <section
      id="current-phase-workspace"
      aria-labelledby="phase-header-title"
      className="current-phase-workspace rounded-lg border bg-card shadow-sm"
    >
      <header className="current-phase-workspace__header border-b border-border px-4 py-4">
        <PhaseHeaderBody data={phaseHeader} />
        {workspacePhaseActions ? <WorkspacePhaseTools payload={workspacePhaseActions} /> : null}
      </header>

      <div className="current-phase-workspace__body p-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] xl:items-start">
          <div>
            <InstructionText>{data.instructions}</InstructionText>
            <InfoCallout>{data.infoMessage}</InfoCallout>
          </div>
          <div className="xl:border-l xl:border-border xl:pl-4">
            <PhaseObjectiveBlock objectives={data.objectives} />
          </div>
        </div>
      </div>
    </section>
  );
}
