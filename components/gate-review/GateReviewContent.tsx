import type { ReactNode } from "react";

export function GateReviewContent({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f8fafc] dark:bg-background">
      {children}
    </div>
  );
}
