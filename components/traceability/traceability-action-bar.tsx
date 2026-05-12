import Link from "next/link";

import { ArrowRight, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { TraceabilityActionState } from "@/types/traceability.types";

export function TraceabilityActionBar({ actionState }: { actionState: TraceabilityActionState }) {
  return (
    <section
      aria-label="Traceability matrix actions"
      className="traceability-action-bar traceability-grid-span-12 shrink-0 flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 min-[901px]:flex-row min-[901px]:items-center"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 grid size-7 place-items-center rounded-full bg-white text-blue-700">
          <Info className="size-4" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">{actionState.title}</p>
          <p className="text-sm text-slate-600">{actionState.description}</p>
        </div>
      </div>
      <Link href={actionState.href}>
        <Button size="lg" className="gap-2" aria-label="Open detailed traceability report">
          {actionState.ctaLabel}
          <ArrowRight className="size-4" aria-hidden />
        </Button>
      </Link>
    </section>
  );
}
