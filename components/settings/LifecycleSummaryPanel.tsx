"use client";

import type { ComponentType } from "react";
import { CalendarClock, FileStack, Layers3, ShieldCheck, Workflow } from "lucide-react";

type Tile = {
  label: string;
  value: string;
  subValue?: string;
  icon: ComponentType<{ className?: string }>;
};

export function LifecycleSummaryPanel({
  totalPhases,
  totalGates,
  totalArtifacts,
  activeTemplates,
  lastUpdatedLabel,
}: {
  totalPhases: number;
  totalGates: number;
  totalArtifacts: number;
  activeTemplates: number;
  lastUpdatedLabel: string;
}) {
  const [primaryDate, ...rest] = lastUpdatedLabel.split(/\s(?=\d{1,2}:\d{2})/);
  const secondaryTime = rest.join(" ").trim();

  const tiles: Tile[] = [
    { label: "Total Phases", value: String(totalPhases), icon: Workflow },
    { label: "Total Gates", value: String(totalGates), icon: ShieldCheck },
    { label: "Total Artifacts", value: String(totalArtifacts), icon: FileStack },
    { label: "Active Templates", value: String(activeTemplates), icon: Layers3 },
    {
      label: "Last Updated",
      value: primaryDate || lastUpdatedLabel,
      subValue: secondaryTime || undefined,
      icon: CalendarClock,
    },
  ];

  return (
    <section
      className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm"
      aria-labelledby="lifecycle-summary-heading"
    >
      <h3 id="lifecycle-summary-heading" className="text-base font-semibold text-slate-900">
        Lifecycle Summary
      </h3>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {tiles.map(({ label, value, subValue, icon: Icon }) => (
          <article
            key={label}
            className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 p-3"
          >
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
              <Icon className="size-3.5 text-slate-400" aria-hidden />
              <span className="truncate">{label}</span>
            </div>
            <div className="mt-3">
              <p className="text-xl font-bold leading-tight text-slate-900">{value}</p>
              {subValue ? <p className="mt-0.5 text-[11px] text-slate-500">{subValue}</p> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
