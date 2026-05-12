import { ExternalLink } from "lucide-react";

import type { LinkedPhase } from "@/types/artifact-library.types";

import { OutlineActionLink, SidebarCard } from "./sidebar-primitives";

export function LinkedPhaseCard({ phase }: { phase: LinkedPhase }) {
  return (
    <SidebarCard title="Linked Phase">
      <div className="mt-6 flex gap-5 sm:mt-8 sm:gap-6">
        <div className="flex flex-col items-center">
          <span className="h-7 w-7 shrink-0 rounded-full bg-blue-600 sm:h-8 sm:w-8" aria-hidden />
          <span className="h-14 w-[3px] shrink-0 rounded-full bg-blue-200 dark:bg-blue-900/60 sm:h-16" aria-hidden />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-600 dark:text-muted-foreground sm:text-base">
            Phase {phase.phaseNumber} of {phase.totalPhases}
          </p>

          <p className="mt-2 text-lg font-semibold text-slate-950 dark:text-foreground sm:mt-3 sm:text-xl">
            {phase.phaseName}
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mt-7">
        <OutlineActionLink href={phase.workspaceHref} icon={<ExternalLink className="h-5 w-5 shrink-0 stroke-[2.3]" aria-hidden />}>
          Go to Phase Workspace
        </OutlineActionLink>
      </div>
    </SidebarCard>
  );
}
