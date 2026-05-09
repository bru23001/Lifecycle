"use client";

import { FileText } from "lucide-react";

import { cn } from "@/lib/utils";
import type { WizardHeaderData } from "@/types/template-wizard.types";

const statusStyles: Record<
  WizardHeaderData["status"],
  { label: string; className: string }
> = {
  not_started: { label: "Not Started", className: "bg-slate-100 text-slate-700" },
  in_progress: { label: "In Progress", className: "bg-[#dbeafe] text-[#1d4ed8]" },
  complete: { label: "Complete", className: "bg-[#dcfce7] text-[#15803d]" },
  in_review: { label: "In Review", className: "bg-[#f3e8ff] text-[#7c3aed]" },
  approved: { label: "Approved", className: "bg-[#dcfce7] text-[#15803d]" },
  changes_requested: {
    label: "Changes Requested",
    className: "bg-[#fee2e2] text-[#b91c1c]",
  },
};

function CompletionRing({ pct }: { pct: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, pct)) / 100) * c;

  return (
    <div className="relative grid size-[92px] shrink-0 place-items-center" aria-hidden>
      <svg width="92" height="92" viewBox="0 0 92 92">
        <circle cx="46" cy="46" r={r} fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="46"
          cy="46"
          r={r}
          fill="none"
          stroke="#2563eb"
          strokeWidth="10"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 46 46)"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center leading-tight">
        <span className="text-lg font-bold text-foreground">{pct}%</span>
        <span className="block text-[10px] font-medium text-muted-foreground">Complete</span>
      </div>
    </div>
  );
}

export function WizardHeader({ data }: { data: WizardHeaderData }) {
  const badge = statusStyles[data.status];
  const metaCards = [
    { label: "Project", value: `${data.projectName} (${data.projectId})` },
    { label: "Phase", value: `${data.phaseNumber}. ${data.phaseName}` },
    { label: "Owner", value: data.ownerName },
    { label: "Template Version", value: data.templateVersion },
    { label: "Artifact Version", value: data.artifactVersion },
    { label: "Last Saved", value: data.lastSavedLabel ?? "—" },
  ];

  return (
    <header className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#f3e8ff] text-[#7c3aed]">
            <FileText className="size-6" aria-hidden />
          </div>
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
                {data.templateCode} {data.templateName}
              </h2>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                  badge.className,
                )}
              >
                {badge.label}
              </span>
            </div>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{data.purpose}</p>
            <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2 xl:grid-cols-3">
              {metaCards.map((meta) => (
                <div
                  key={meta.label}
                  className="rounded-xl border bg-muted/20 px-3 py-2"
                >
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {meta.label}
                  </dt>
                  <dd className="truncate text-sm font-semibold text-foreground">{meta.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-2 lg:items-end">
          <CompletionRing pct={data.completionPercent} />
        </div>
      </div>
    </header>
  );
}
