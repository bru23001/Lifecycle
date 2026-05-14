"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

import type { GateEvidenceItem } from "@/types/gate-review.types";
import type { GateId } from "@/lib/gateRules";
import { Button, buttonVariants } from "@/components/ui/button";

import { AddGateEvidenceModal } from "./add-gate-evidence-modal";
import {
  EvidenceFileIcon,
  EvidencePreviewDownloadActions,
  evidenceToneForIndex,
  evidenceTypeLabel,
  formatEvidenceAddedOn,
  GateCountBadge,
} from "./gate-review-shared-widgets";
import { RemoveGateEvidenceModal } from "./remove-gate-evidence-modal";

export function CompletionEvidence({
  projectId,
  gateCode,
  phaseNumber,
  artifactPickerOptions,
  evidence,
  onPreview,
  onMutated,
}: {
  projectId: string;
  /** Canonical gate id for server actions and evidence center filter (e.g. `G1`). */
  gateCode: GateId;
  phaseNumber: number;
  artifactPickerOptions: { id: string; label: string }[];
  evidence: GateEvidenceItem[];
  onPreview: (item: GateEvidenceItem) => void;
  onMutated: () => void;
}) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<GateEvidenceItem | null>(null);

  const viewAllHref = `/projects/${projectId}/evidence?gate=${encodeURIComponent(gateCode)}`;

  const onRowNavigate = useCallback(
    (row: GateEvidenceItem) => {
      router.push(row.href);
    },
    [router],
  );

  return (
    <article className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card">
      <AddGateEvidenceModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        projectId={projectId}
        gateId={gateCode}
        defaultPhaseNumber={phaseNumber}
        artifactPickerOptions={artifactPickerOptions}
        onSaved={onMutated}
      />
      <RemoveGateEvidenceModal
        open={Boolean(removeTarget)}
        onClose={() => setRemoveTarget(null)}
        projectId={projectId}
        gateId={gateCode}
        item={removeTarget}
        onRemoved={onMutated}
      />

      <header className="mb-0 shrink-0 border-b border-slate-100 px-8 pb-4 pt-8 dark:border-border">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-xl font-semibold text-slate-950 dark:text-foreground">Completion Evidence</h2>
            <GateCountBadge count={evidence.length} />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => setAddOpen(true)}
              data-testid="completion-evidence-add"
            >
              <Plus className="size-4" aria-hidden />
              Add evidence
            </Button>
            <Link
              href={viewAllHref}
              className="text-base font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              data-testid="completion-evidence-view-all"
            >
              View all evidence
            </Link>
          </div>
        </div>
      </header>

      {evidence.length === 0 ? (
        <div className="px-8 pb-8 pt-4">
          <p className="text-sm text-slate-600 dark:text-muted-foreground">No completion evidence attached.</p>
        </div>
      ) : (
        <div className="lifecycle-scroll min-h-0 flex-1 overflow-y-auto overflow-x-auto px-8 pb-8 pt-4">
          <table className="w-full min-w-[1000px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 text-sm font-semibold text-slate-900 dark:border-border dark:text-foreground">
                <th className="pb-4 pr-8">Evidence Name</th>
                <th className="pb-4 pr-8">Type</th>
                <th className="pb-4 pr-8">Linked To</th>
                <th className="pb-4 pr-8">Added By</th>
                <th className="pb-4 pr-8">Added On</th>
                <th className="pb-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {evidence.map((row, index) => {
                const tone = evidenceToneForIndex(index);
                const typeLabel = evidenceTypeLabel(row.type);
                return (
                  <tr
                    key={row.id}
                    role="link"
                    tabIndex={0}
                    className="cursor-pointer border-b border-slate-100 text-base last:border-b-0 hover:bg-slate-50/80 dark:border-border dark:hover:bg-muted/40"
                    onClick={() => onRowNavigate(row)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRowNavigate(row);
                      }
                    }}
                    data-testid={`completion-evidence-row-${row.id}`}
                  >
                    <td className="py-5 pr-8">
                      <div className="flex items-center gap-5">
                        <EvidenceFileIcon type={row.type} tone={tone} />

                        <span className="font-semibold text-slate-950 dark:text-foreground">{row.name}</span>
                      </div>
                    </td>

                    <td className="py-5 pr-8 font-medium text-slate-700 dark:text-foreground/90">{typeLabel}</td>

                    <td className="py-5 pr-8 text-slate-700 dark:text-foreground/90">{row.linkedTo.join(", ")}</td>

                    <td className="py-5 pr-8 text-slate-700 dark:text-foreground/90">{row.addedBy}</td>

                    <td className="whitespace-pre-line py-5 pr-8 text-slate-700 dark:text-foreground/90">
                      {formatEvidenceAddedOn(row.addedOnLabel)}
                    </td>

                    <td className="py-5" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                      <div className="flex flex-wrap items-center gap-3">
                        <EvidencePreviewDownloadActions
                          name={row.name}
                          onPreview={() => onPreview(row)}
                          downloadHref={row.downloadHref ?? row.href}
                        />
                        <button
                          type="button"
                          className={buttonVariants({
                            variant: "ghost",
                            size: "icon-sm",
                            className: "text-destructive hover:bg-destructive/10 hover:text-destructive",
                          })}
                          aria-label={`Remove ${row.name} from gate package`}
                          onClick={() => setRemoveTarget(row)}
                          data-testid={`completion-evidence-remove-${row.id}`}
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
