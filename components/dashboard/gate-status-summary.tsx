import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock3 } from "lucide-react";

import type { DashboardGateStatus } from "@/types/dashboard.types";

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

export function GateStatusSummary({ gateStatuses }: { gateStatuses: DashboardGateStatus[] }) {
  return (
    <article className="h-full rounded-xl border border-slate-200 bg-white p-7 shadow-sm dark:border-[var(--cc-border)] dark:bg-card">
      <header className="mb-10 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-100">
          Gate Status Summary
        </h2>
        <Link
          href="/approvals"
          className="text-base font-semibold text-blue-600 hover:text-blue-700"
        >
          View all gates
        </Link>
      </header>

      <div className="space-y-8">
        {gateStatuses.map((gate) => {
          return (
            <div
              key={gate.gateId}
              className="grid grid-cols-1 gap-3 xl:grid-cols-[28px_minmax(180px,1.25fr)_minmax(170px,0.85fr)_minmax(120px,1fr)] xl:items-center"
            >
              <GateIcon status={gate.label} />

              <p className="text-base font-medium text-slate-900 dark:text-slate-100">
                {gate.gateId}: {gate.title}
              </p>

              <StatusBadge gate={gate} />

              <GateProgressBar gate={gate} />
            </div>
          );
        })}
      </div>
    </article>
  );
}
