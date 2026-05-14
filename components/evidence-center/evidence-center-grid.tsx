import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function EvidenceCenterGrid({
  itemsPanel,
  detailPanel,
  coveragePanel,
  activePane,
  className,
}: {
  itemsPanel: ReactNode;
  detailPanel: ReactNode;
  coveragePanel: ReactNode;
  activePane: "items" | "detail" | "coverage";
  className?: string;
}) {
  return (
    <div
      data-active-pane={activePane}
      className={cn("evidence-center mx-auto w-full max-w-[1920px] flex-1 min-h-0 overflow-hidden px-5 min-[901px]:px-8", className)}
    >
      <section data-pane="items" className="evidence-items-panel min-w-0">
        {itemsPanel}
      </section>
      <section data-pane="detail" className="evidence-detail-panel min-w-0">
        {detailPanel}
      </section>
      <aside data-pane="coverage" id="evidence-coverage" className="evidence-coverage-panel min-w-0">
        {coveragePanel}
      </aside>
    </div>
  );
}
