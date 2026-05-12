import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type GateReviewMobilePane = "overview" | "inputs" | "decision";

export function GateReviewGrid({
  overviewColumn,
  inputsEvidenceColumn,
  decisionColumn,
  activePane,
  className,
}: {
  overviewColumn: ReactNode;
  inputsEvidenceColumn: ReactNode;
  decisionColumn: ReactNode;
  activePane: GateReviewMobilePane;
  className?: string;
}) {
  return (
    <div
      data-active-pane={activePane}
      className={cn(
        "gate-review grid grid-cols-1 gap-[var(--grid-gap)] bg-[var(--app-bg)] pb-6 pt-6 dark:bg-background",
        "xl:grid-cols-[430px_minmax(0,1fr)_minmax(0,1fr)] xl:items-stretch xl:gap-6",
        className,
      )}
    >
      <div
        data-pane="overview"
        className="gate-overview-column mx-auto flex w-full min-w-0 max-w-[430px] flex-col max-xl:h-auto xl:mx-0 xl:h-full xl:min-h-0 xl:max-w-none"
      >
        {overviewColumn}
      </div>
      <div
        data-pane="inputs"
        className="gate-inputs-evidence-column flex min-w-0 flex-col gap-6 max-xl:h-auto xl:h-full xl:min-h-0"
      >
        {inputsEvidenceColumn}
      </div>
      <div
        data-pane="decision"
        className="gate-decision-column flex min-h-0 min-w-0 flex-col gap-6 max-xl:h-auto xl:h-full xl:min-h-0"
      >
        {decisionColumn}
      </div>
    </div>
  );
}
