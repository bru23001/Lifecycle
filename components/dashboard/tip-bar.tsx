import Link from "next/link";
import { Sparkles } from "lucide-react";

import type { DashboardTip } from "@/types/dashboard.types";

export function TipBar({ tip }: { tip: DashboardTip }) {
  return (
    <footer className="cc-card-standard span-12 action-bar flex min-h-[44px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between dark:border-[var(--cc-border)] dark:bg-card">
      <span className="flex items-center gap-[10px]">
        <Sparkles className="size-[15px] shrink-0 text-amber-500" aria-hidden />
        {tip.message}
      </span>
      <Link href={tip.ctaHref} className="cc-card-link shrink-0">
        {tip.ctaLabel}
      </Link>
    </footer>
  );
}
