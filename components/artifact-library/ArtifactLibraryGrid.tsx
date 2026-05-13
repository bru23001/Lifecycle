import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function ArtifactLibraryGrid({
  listPanel,
  detailPanel,
  contextPanel,
  activePane,
}: {
  listPanel: ReactNode;
  detailPanel: ReactNode;
  contextPanel: ReactNode;
  activePane: "list" | "detail" | "context";
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1920px] flex-1 flex-col gap-0 px-5 pb-10 min-[901px]:px-8">
      <div className="hidden min-h-0 gap-6 lg:grid lg:grid-cols-[minmax(240px,320px)_minmax(0,1fr)_minmax(260px,320px)] lg:items-start lg:pt-4">
        <div className="min-h-0 space-y-4">{listPanel}</div>
        <div className="min-h-0 space-y-4">{detailPanel}</div>
        <div className="min-h-0 space-y-4">{contextPanel}</div>
      </div>
      <div className={cn("min-h-0 flex-1 space-y-4 pt-2 lg:hidden", activePane === "list" ? "block" : "hidden")}>
        {listPanel}
      </div>
      <div className={cn("min-h-0 flex-1 space-y-4 pt-2 lg:hidden", activePane === "detail" ? "block" : "hidden")}>
        {detailPanel}
      </div>
      <div className={cn("min-h-0 flex-1 space-y-4 pt-2 lg:hidden", activePane === "context" ? "block" : "hidden")}>
        {contextPanel}
      </div>
    </div>
  );
}
