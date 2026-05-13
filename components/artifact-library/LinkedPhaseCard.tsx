import Link from "next/link";

import type { LinkedPhase } from "@/types/artifact-library.types";
import { cn } from "@/lib/utils";

export function LinkedPhaseCard({ phase }: { phase: LinkedPhase }) {
  const statusClass =
    phase.status === "complete"
      ? "bg-emerald-50 text-emerald-800"
      : phase.status === "in_progress"
        ? "bg-blue-50 text-blue-800"
        : phase.status === "approved"
          ? "bg-emerald-50 text-emerald-800"
          : "bg-slate-100 text-slate-700";

  return (
    <section className="cc-card-standard p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Linked phase</h3>
      <p className="mt-2 text-sm font-semibold text-foreground">
        Phase {phase.phaseNumber} of {phase.totalPhases}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{phase.phaseName}</p>
      <span className={cn("mt-3 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize", statusClass)}>
        {phase.status.replaceAll("_", " ")}
      </span>
      <Link
        href={phase.workspaceHref}
        className="mt-4 inline-flex text-xs font-semibold text-[#2563eb] hover:underline"
      >
        Open in workspace
      </Link>
    </section>
  );
}
