import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function GateReviewGrid({
  overviewColumn,
  inputsEvidenceColumn,
  decisionColumn,
  className,
}: {
  overviewColumn: ReactNode;
  inputsEvidenceColumn: ReactNode;
  decisionColumn: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "gate-review grid min-h-[calc(100vh-76px)] grid-cols-1 gap-5 bg-[#f8fafc] px-5 pb-28 pt-6 dark:bg-background max-[900px]:pb-28 min-[901px]:grid-cols-[280px_minmax(0,1fr)] min-[901px]:px-8 min-[1281px]:grid-cols-[300px_minmax(0,1fr)_420px]",
        className,
      )}
    >
      <div className="gate-overview-column flex min-w-0 flex-col gap-5">{overviewColumn}</div>
      <div className="gate-inputs-evidence-column flex min-w-0 flex-col gap-5">{inputsEvidenceColumn}</div>
      <div
        className={cn(
          "gate-decision-column min-w-0 gap-5",
          "flex flex-col",
          "min-[901px]:max-[1280px]:col-span-2 min-[901px]:max-[1280px]:grid min-[901px]:max-[1280px]:grid-cols-3",
          "min-[1281px]:flex min-[1281px]:flex-col",
        )}
      >
        {decisionColumn}
      </div>
    </div>
  );
}
