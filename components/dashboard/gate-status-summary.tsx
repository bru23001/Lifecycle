import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock3 } from "lucide-react";

import type { DashboardGateStatus } from "@/types/dashboard.types";
import { cn } from "@/lib/utils";

function GateIcon({ status }: { status: DashboardGateStatus["label"] }) {
  if (status === "Approved") {
    return <CheckCircle2 className="h-6 w-6 text-emerald-500" />;
  }

  if (status === "Changes Requested") {
    return <AlertCircle className="h-6 w-6 text-red-500" />;
  }

  return <Clock3 className="h-6 w-6 text-amber-500" />;
}

function StatusBadge({ gate }: { gate: DashboardGateStatus }) {
  const statusClasses = {
    Approved: "text-emerald-600",
    Pending: "text-slate-600 dark:text-slate-300",
    "Changes Requested": "text-red-500",
  };

  const ringClasses = {
    Approved: "border-emerald-200 text-emerald-500",
    Pending: "border-slate-300 text-slate-500 dark:border-slate-600 dark:text-slate-300",
    "Changes Requested": "border-red-200 text-red-500",
  };

  return (
    <div className="flex items-center gap-3">
      <span className={["font-semibold", statusClasses[gate.label]].join(" ")}>{gate.count}</span>

      <span
        className={[
          "flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-semibold",
          ringClasses[gate.label],
        ].join(" ")}
      >
        {gate.label === "Approved" ? "✓" : ""}
      </span>

      <span className={["font-semibold", statusClasses[gate.label]].join(" ")}>{gate.label}</span>
    </div>
  );
}

function GateProgressBar({ gate }: { gate: DashboardGateStatus }) {
  const barClasses = {
    Approved: "bg-emerald-500",
    Pending: "bg-amber-400",
    "Changes Requested": "bg-red-500",
  };

  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
      <div
        className={["h-full rounded-full", barClasses[gate.label]].join(" ")}
        style={{ width: `${gate.widthPercent}%` }}
      />
    </div>
  );
}

const rowGridClass =
  "grid grid-cols-1 gap-3 xl:grid-cols-[28px_minmax(180px,1.25fr)_minmax(170px,0.85fr)_minmax(120px,1fr)] xl:items-center";

export function GateStatusSummary({
  gateStatuses,
  projectId,
  defaultReviewHref,
  allGatesHref,
}: {
  gateStatuses: DashboardGateStatus[];
  projectId: string | null;
  defaultReviewHref: string | null;
  allGatesHref: string | null;
}) {
  return (
    <article className="h-full rounded-xl border border-slate-200 bg-white p-7 shadow-sm dark:border-[var(--cc-border)] dark:bg-card">
      <header className="mb-10 flex items-center justify-between gap-3">
        <div className="min-w-0">
          {defaultReviewHref ? (
            <Link href={defaultReviewHref} className="block hover:opacity-90">
              <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-100">
                Gate Status Summary
              </h2>
            </Link>
          ) : (
            <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-100">Gate Status Summary</h2>
          )}
        </div>
        <Link
          href={allGatesHref ?? "/approvals"}
          className="shrink-0 text-base font-semibold text-blue-600 hover:text-blue-700"
        >
          {allGatesHref ? "View all gates" : "Approvals"}
        </Link>
      </header>

      <div className="space-y-8">
        {gateStatuses.map((gate) => {
          const rowProjectId = gate.reviewProjectId ?? projectId;
          const rowHref =
            rowProjectId != null
              ? `/projects/${rowProjectId}/gates/${gate.gateId.toLowerCase()}/review`
              : null;

          const rowInner = (
            <>
              <GateIcon status={gate.label} />

              <p className="text-base font-medium text-slate-900 dark:text-slate-100">
                {gate.gateId}: {gate.title}
              </p>

              <StatusBadge gate={gate} />

              <GateProgressBar gate={gate} />
            </>
          );

          return rowHref ? (
            <Link
              key={gate.gateId}
              href={rowHref}
              className={cn(
                rowGridClass,
                "-mx-2 rounded-lg px-2 py-1 outline-none ring-offset-white transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#2563eb] dark:ring-offset-card dark:hover:bg-slate-800/40",
              )}
            >
              {rowInner}
            </Link>
          ) : (
            <div key={gate.gateId} className={rowGridClass}>
              {rowInner}
            </div>
          );
        })}
      </div>
    </article>
  );
}
