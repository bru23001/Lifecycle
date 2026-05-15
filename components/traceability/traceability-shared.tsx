import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";

/** Coverage / inventory counts on white table rows (e.g. 0 vs 1) — strong contrast vs `bg-white`. */
export const traceabilityCountCellClass = "tabular-nums text-sm font-semibold text-slate-950";

const toneClass: Record<"gray" | "green" | "amber" | "red", string> = {
  gray: "border-slate-300 bg-slate-200 text-slate-950 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100",
  green: "border-emerald-300 bg-emerald-100 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100",
  amber: "border-amber-300 bg-amber-100 text-amber-950 dark:border-amber-800 dark:bg-amber-950/45 dark:text-amber-100",
  red: "border-red-300 bg-red-100 text-red-950 dark:border-red-900 dark:bg-red-950/45 dark:text-red-100",
};

export function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: keyof typeof toneClass;
}) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", toneClass[tone])}>
      {label}
    </span>
  );
}

export function CoverageProgressBar({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  const toneClassName = clamped >= 80 ? "bg-emerald-600" : clamped >= 50 ? "bg-amber-600" : "bg-red-600";
  return (
    <div className="flex items-center gap-2">
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-slate-300 dark:bg-slate-600"
        role="progressbar"
        aria-label={label}
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className={cn("h-full rounded-full transition-[width]", toneClassName)} style={{ width: `${clamped}%` }} />
      </div>
      <span className="min-w-[2.75rem] shrink-0 text-right text-xs font-bold tabular-nums text-slate-950 dark:text-slate-100">
        {Math.round(clamped)}%
      </span>
    </div>
  );
}

export function CoverageRing({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div
      className="grid size-28 place-items-center rounded-full border-8 border-white bg-white shadow-sm"
      style={{
        backgroundImage: `conic-gradient(#16a34a ${clamped}%, #e2e8f0 ${clamped}% 100%)`,
      }}
      role="img"
      aria-label={`Overall coverage ${clamped}%`}
    >
      <div className="grid size-20 place-items-center rounded-full bg-white text-center">
        <div>
          <p className="text-2xl font-bold text-slate-900">{clamped}%</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">Overall</p>
        </div>
      </div>
    </div>
  );
}

export function CardShell({
  title,
  count,
  viewAllHref,
  showViewAll = true,
  children,
}: {
  title: string;
  count: number;
  viewAllHref: string;
  /** When false, hides the header “View All” link (e.g. on the full gaps screen). */
  showViewAll?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="traceability-card flex h-full min-h-0 min-w-0 flex-col rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <header className="shrink-0 flex items-center justify-between border-b border-[#eef2f7] px-4 py-3">
        <div className="flex items-center gap-2">
          <h2 className="text-[15px] font-semibold text-slate-900">{title}</h2>
          <span className="rounded-full border border-slate-300 bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-950 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
            {count}
          </span>
        </div>
        {showViewAll ? (
          <Link href={viewAllHref} className="text-xs font-semibold text-[#2563eb] hover:underline">
            View All
          </Link>
        ) : null}
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">{children}</div>
    </section>
  );
}

export function EmptyState({
  message,
  ctaLabel,
  ctaHref,
  tone = "default",
}: {
  message: string;
  ctaLabel: string;
  ctaHref: string;
  tone?: "default" | "success";
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-5 text-sm",
        tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-slate-50 text-slate-600",
      )}
    >
      <p>{message}</p>
      <Link href={ctaHref} className="mt-2 inline-flex items-center gap-1 font-semibold text-[#2563eb] hover:underline">
        {ctaLabel}
        <ArrowRight className="size-3.5" aria-hidden />
      </Link>
    </div>
  );
}

export function MetricTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export function tableRowClass() {
  return "border-b border-slate-100 last:border-b-0";
}
