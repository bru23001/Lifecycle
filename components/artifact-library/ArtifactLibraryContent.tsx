import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function ArtifactLibraryContent({
  children,
  className,
  "data-testid": dataTestId,
}: {
  children: ReactNode;
  className?: string;
  "data-testid"?: string;
}) {
  return (
    <div data-testid={dataTestId} className={cn("flex min-h-0 flex-1 flex-col gap-0", className)}>
      {children}
    </div>
  );
}
