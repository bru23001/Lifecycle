import Link from "next/link";
import { FileText, FolderOpen, SearchCheck, ShieldCheck, Users } from "lucide-react";

import type { DashboardMetric } from "@/types/dashboard.types";

function metricIcon(label: DashboardMetric["label"]) {
  switch (label) {
    case "Active Projects":
      return FolderOpen;
    case "Lifecycle Progress":
      return SearchCheck;
    case "Gate Status Summary":
      return ShieldCheck;
    case "Blockers / Missing Evidence":
      return FileText;
    default:
      return Users;
  }
}

function metricToneClass(tone: DashboardMetric["tone"]) {
  switch (tone) {
    case "green":
      return "bg-emerald-50 text-emerald-600";
    case "amber":
      return "bg-amber-50 text-amber-600";
    case "red":
      return "bg-rose-50 text-rose-600";
    case "purple":
      return "bg-fuchsia-50 text-fuchsia-600";
    default:
      return "bg-blue-50 text-blue-600";
  }
}

function metricNoteToneClass(tone: DashboardMetric["tone"]) {
  switch (tone) {
    case "green":
      return "text-emerald-600";
    case "amber":
      return "text-amber-600";
    case "red":
      return "text-rose-600";
    case "purple":
      return "text-fuchsia-600";
    default:
      return "text-blue-600";
  }
}

export function MetricsGrid({
  metrics,
  stacked = false,
}: {
  metrics: DashboardMetric[];
  stacked?: boolean;
}) {
  return (
    <section
      className={
        stacked
          ? "grid h-full grid-rows-5 gap-3 max-[1200px]:grid-cols-1 max-[1200px]:grid-rows-none"
          : "grid grid-cols-5 gap-[var(--grid-gap)]"
      }
    >
      {metrics.map((metric) => {
        const Icon = metricIcon(metric.label);
        return (
          <Link
            key={metric.id}
            href={metric.targetHref}
            className={`cc-card-standard metric-card flex items-start gap-[12px] dark:border-[var(--cc-border)] dark:bg-card ${
              stacked
                ? "h-full min-h-0 w-full p-3.5"
                : "h-[var(--dashboard-kpi-card-height)] min-w-0 p-3"
            }`}
          >
            <div
              className={`grid size-[32px] shrink-0 place-items-center rounded-[9px] ${metricToneClass(metric.tone)}`}
            >
              <Icon className="size-[15px]" aria-hidden />
            </div>
            <div className="min-h-0 min-w-0 flex-1">
              <p className="text-[11px] font-semibold leading-[1.2] text-slate-500 dark:text-slate-300">
                {metric.label}
              </p>
              <p className="mt-1 text-[20px] font-bold leading-none tracking-tight">
                {metric.value}
              </p>
              <p
                className={`mt-1 text-[11px] font-semibold leading-[1.2] ${metricNoteToneClass(metric.tone)}`}
              >
                {metric.note}
              </p>
            </div>
          </Link>
        );
      })}
    </section>
  );
}
