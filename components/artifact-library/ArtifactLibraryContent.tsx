import type { ReactNode } from "react";

export function ArtifactLibraryContent({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--app-bg)]">
      {children}
    </div>
  );
}
