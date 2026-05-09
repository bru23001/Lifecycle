import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { linkedGateStatusBadgeMap } from "@/lib/artifact-status";
import { cn } from "@/lib/utils";
import type { LinkedGate } from "@/types/artifact-library.types";

import { StatusBadge } from "./status-badge";

export function LinkedGateCard({ gate }: { gate: LinkedGate }) {
  const status = linkedGateStatusBadgeMap[gate.status];
  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm dark:border-border dark:bg-card">
      <h3 className="text-sm font-semibold text-[#111827] dark:text-foreground">Linked Gate</h3>
      <div className="mt-3 rounded-xl border border-[#e5e7eb] p-3 dark:border-border">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-[#2563eb]" aria-hidden />
          <p className="text-sm font-semibold text-[#111827] dark:text-foreground">
            {gate.gateCode} - {gate.gateName}
          </p>
        </div>
        <div className="mt-2">
          <StatusBadge label={status.label} tone={status.tone} />
        </div>
      </div>
      <Link
        href={gate.reviewHref}
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-3 w-full")}
      >
        Open Gate Review
      </Link>
    </section>
  );
}
