"use client";

import type { ReactNode } from "react";

type ApprovalCenterGridProps = {
  mobilePane: "queue" | "detail" | "review";
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
};

export function ApprovalCenterGrid({ mobilePane, left, center, right }: ApprovalCenterGridProps) {
  return (
    <div
      data-active-pane={mobilePane}
      className="approval-center mx-auto w-full max-w-[1920px] flex-1 min-h-0 overflow-hidden px-5 pb-4 min-[901px]:px-8"
    >
      {left}
      {center}
      {right}
    </div>
  );
}
