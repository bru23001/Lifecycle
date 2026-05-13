import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import type { DashboardSettingsAlert } from "@/types/dashboard.types";

export function DashboardSettingsAlerts({ alerts }: { alerts: DashboardSettingsAlert[] }) {
  if (alerts.length === 0) return null;

  return (
    <div className="col-span-12 flex flex-col gap-3" role="region" aria-label="Platform configuration notices">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="cc-card-standard flex min-h-[44px] flex-col gap-3 border-amber-200/80 bg-amber-50/40 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900/50 dark:bg-amber-950/25"
        >
          <span className="flex items-start gap-3 text-sm leading-relaxed text-slate-800 dark:text-slate-100">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
            {alert.message}
          </span>
          <Link
            href={alert.ctaHref}
            className="cc-card-link shrink-0 text-sm font-semibold text-blue-700 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {alert.ctaLabel}
          </Link>
        </div>
      ))}
    </div>
  );
}
