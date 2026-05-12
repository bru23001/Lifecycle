"use client";

import type { ReactNode } from "react";

export function WizardGrid({
  mobilePane,
  children,
}: {
  mobilePane: "selection" | "editor" | "validation";
  children: ReactNode;
}) {
  return (
    <div
      data-active-pane={mobilePane}
      className="template-wizard-grid mx-auto w-full max-w-[1920px] flex-1 min-h-0 overflow-hidden"
    >
      {children}
    </div>
  );
}
