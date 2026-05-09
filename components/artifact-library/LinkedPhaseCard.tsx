import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LinkedPhase } from "@/types/artifact-library.types";

export function LinkedPhaseCard({ phase }: { phase: LinkedPhase }) {
  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm dark:border-border dark:bg-card">
      <h3 className="text-sm font-semibold text-[#111827] dark:text-foreground">Linked Phase</h3>
      <div className="mt-3 rounded-xl border border-[#e5e7eb] p-3 dark:border-border">
        <p className="text-xs text-[#64748b] dark:text-muted-foreground">
          Phase {phase.phaseNumber} of {phase.totalPhases}
        </p>
        <p className="mt-1 text-sm font-semibold text-[#111827] dark:text-foreground">
          {phase.phaseName}
        </p>
      </div>
      <Link
        href={phase.workspaceHref}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-3 w-full")}
      >
        Go to Phase Workspace
      </Link>
    </section>
  );
}
