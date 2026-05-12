import { ExternalLink, Shield } from "lucide-react";

import { linkedGateStatusBadgeMap } from "@/lib/artifact-status";
import { cn } from "@/lib/utils";
import type { LinkedGate } from "@/types/artifact-library.types";

import { OutlineActionLink, SidebarCard } from "./sidebar-primitives";

const gatePillClass: Record<"gray" | "green" | "amber" | "red", string> = {
  gray: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200",
  amber: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
  red: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-200",
};

export function LinkedGateCard({ gate }: { gate: LinkedGate }) {
  const status = linkedGateStatusBadgeMap[gate.status];

  return (
    <SidebarCard title="Linked Gate">
      <div className="mt-6 flex items-center gap-5 sm:mt-8 sm:gap-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center text-slate-900 dark:text-foreground sm:h-12 sm:w-12">
          <Shield className="h-10 w-10 stroke-[1.8] sm:h-12 sm:w-12" aria-hidden />
        </div>

        <div className="min-w-0">
          <p className="text-lg font-semibold text-slate-950 dark:text-foreground sm:text-xl">
            {gate.gateCode} - {gate.gateName}
          </p>

          <span
            className={cn(
              "mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold sm:mt-3 sm:py-1.5",
              gatePillClass[status.tone],
            )}
          >
            {status.label}
          </span>
        </div>
      </div>

      <div className="mt-6 sm:mt-8">
        <OutlineActionLink href={gate.reviewHref} icon={<ExternalLink className="h-5 w-5 shrink-0 stroke-[2.3]" aria-hidden />}>
          Open Gate Review
        </OutlineActionLink>
      </div>
    </SidebarCard>
  );
}
