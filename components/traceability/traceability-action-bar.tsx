import Link from "next/link";

import { ArrowRight, Download, Info, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { exportTraceabilityMatrix } from "@/lib/traceability-export";
import type { TraceabilityActionState, TraceabilityMatrixData } from "@/types/traceability.types";

export function TraceabilityActionBar({
  actionState,
  matrixData,
  onCreateTraceLink,
  onOpenExportModal,
}: {
  actionState: TraceabilityActionState;
  matrixData: TraceabilityMatrixData;
  onCreateTraceLink?: () => void;
  /** Opens advanced export modal (matrix / gaps shell). */
  onOpenExportModal?: () => void;
}) {
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
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Export traceability matrix">
          {onOpenExportModal ? (
            <Button type="button" size="sm" variant="outline" className="gap-1.5 bg-white" onClick={onOpenExportModal}>
              <Download className="size-3.5" aria-hidden />
              Export matrix…
            </Button>
          ) : (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5 bg-white"
                onClick={() => exportTraceabilityMatrix(matrixData, "csv")}
              >
                CSV
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5 bg-white"
                onClick={() => exportTraceabilityMatrix(matrixData, "json")}
              >
                JSON
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5 bg-white"
                onClick={() => exportTraceabilityMatrix(matrixData, "pdf")}
              >
                HTML
              </Button>
            </>
          )}
        </div>
        {onCreateTraceLink ? (
          <Button
            type="button"
            size="lg"
            variant="outline"
            className="gap-2 bg-white"
            onClick={onCreateTraceLink}
            aria-label="Create a manual trace link"
          >
            <Plus className="size-4" aria-hidden />
            Create Trace Link
          </Button>
        ) : null}
        <Link href={actionState.href}>
          <Button size="lg" className="gap-2" aria-label="Open detailed traceability report">
            {actionState.ctaLabel}
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        </Link>
      </div>
    </section>
  );
}
