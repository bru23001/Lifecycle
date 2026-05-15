import type { ReactNode } from "react";

/**
 * Keeps dashboard cards expanded on first paint while suppressing benign
 * hydration noise around browser normalization of `<details open>`.
 */
export function DetailsExpandedAfterMount({
  className,
  children,
  "data-testid": dataTestId,
}: {
  className?: string;
  children: ReactNode;
  "data-testid"?: string;
}) {
  return (
    <details open suppressHydrationWarning className={className} data-testid={dataTestId}>
      {children}
    </details>
  );
}
