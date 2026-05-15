import Link from "next/link";
import { ChevronDown, Sparkles } from "lucide-react";

import type { DashboardTip } from "@/types/dashboard.types";

export function TipBar({ tip }: { tip: DashboardTip }) {
  return (
    <details open className="cc-card-standard span-12 overflow-hidden dark:border-[var(--cc-border)] dark:bg-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-2.5 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          <Sparkles className="size-[13px] shrink-0 text-amber-500" aria-hidden />
          <span className="text-sm font-semibold">Tip</span>
        </span>
        <ChevronDown className="size-3.5 shrink-0 text-slate-500" aria-hidden />
      </summary>
      <div className="flex flex-col gap-2 px-2.5 pb-2.5 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-xs">{tip.message}</span>
        <Link href={tip.ctaHref} className="cc-card-link shrink-0 text-xs">
          {tip.ctaLabel}
        </Link>
      </div>
    </details>
  );
}
