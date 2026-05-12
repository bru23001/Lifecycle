import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function ArtifactLibraryGrid({
  listPanel,
  detailPanel,
  contextPanel,
  activePane,
  className,
}: {
  listPanel: ReactNode;
  detailPanel: ReactNode;
  contextPanel: ReactNode;
  activePane: "list" | "detail" | "context";
  className?: string;
}) {
  return (
    <div
      data-active-pane={activePane}
      className={cn("artifact-library mx-auto w-full max-w-[1920px] flex-1 min-h-0 overflow-hidden", className)}
    >
      <div data-pane="list" className="artifact-list-panel">
        {listPanel}
      </div>
      <div data-pane="detail" className="artifact-detail-panel">
        {detailPanel}
      </div>
      <aside data-pane="context" className="artifact-context-panel">
        {contextPanel}
      </aside>
    </div>
  );
}
