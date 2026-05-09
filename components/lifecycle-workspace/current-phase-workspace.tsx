import type { ReactNode } from "react";
import { AlertTriangle, ClipboardList } from "lucide-react";

import type { CurrentPhaseWorkspaceData } from "@/components/lifecycle-workspace/current-phase-workspace-types";

function CardTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-semibold leading-none tracking-tight text-foreground">
      <span className="inline-flex size-5 items-center justify-center rounded bg-[#e7f0ff]">
        <ClipboardList className="size-3.5 text-[#2563eb]" aria-hidden />
      </span>
      {children}
    </h3>
  );
}

function InstructionText({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{children}</p>
  );
}

function InfoCallout({ children }: { children: ReactNode }) {
  return (
    <div
      className="mt-4 flex gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5 text-sm text-sky-950 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100"
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
    <div className="phase-objective-block mt-4 border-t border-border pt-3">
      <p className="text-xs font-semibold tracking-wide text-foreground">
        Key Objectives
      </p>
      <ul className="mt-2 grid list-disc gap-x-6 gap-y-1.5 pl-5 text-[13px] text-foreground md:grid-cols-2">
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
  data: CurrentPhaseWorkspaceData;
};

export function CurrentPhaseWorkspace({ data }: CurrentPhaseWorkspaceProps) {
  return (
    <section
      id="current-phase-workspace"
      aria-labelledby="current-phase-workspace-heading"
      className="current-phase-workspace rounded-lg border bg-card p-4 shadow-sm"
    >
      <CardTitle>
        <span id="current-phase-workspace-heading">{data.title}</span>
      </CardTitle>
      <InstructionText>{data.instructions}</InstructionText>
      <InfoCallout>{data.infoMessage}</InfoCallout>
      <PhaseObjectiveBlock objectives={data.objectives} />
    </section>
  );
}
