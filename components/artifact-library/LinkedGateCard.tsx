import Link from "next/link";

import type { LinkedGate } from "@/types/artifact-library.types";
import { cn } from "@/lib/utils";

export function LinkedGateCard({ gate }: { gate: LinkedGate }) {
  const statusClass =
    gate.status === "approved"
      ? "bg-emerald-50 text-emerald-800"
      : gate.status === "rejected" || gate.status === "changes_requested"
        ? "bg-rose-50 text-rose-800"
        : gate.status === "pending_decision"
          ? "bg-amber-50 text-amber-800"
          : "bg-slate-100 text-slate-700";

  return (
    <section className="cc-card-standard p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Linked gate</h3>
      <p className="mt-2 text-sm font-semibold text-foreground">
        {gate.gateCode} · {gate.gateName}
      </p>
      <span className={cn("mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize", statusClass)}>
        {gate.status.replaceAll("_", " ")}
      </span>
      <Link href={gate.reviewHref} className="mt-4 inline-flex text-xs font-semibold text-[#2563eb] hover:underline">
        Open gate review
      </Link>
    </section>
  );
}
