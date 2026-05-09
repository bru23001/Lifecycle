import type { ReactNode } from "react";

export function ArtifactLibraryGrid({
  listPanel,
  detailPanel,
  contextPanel,
}: {
  listPanel: ReactNode;
  detailPanel: ReactNode;
  contextPanel: ReactNode;
}) {
  return (
    <div className="artifact-library">
      <div className="artifact-list-panel">{listPanel}</div>
      <div className="artifact-detail-panel">{detailPanel}</div>
      <aside className="artifact-context-panel">{contextPanel}</aside>
    </div>
  );
}
