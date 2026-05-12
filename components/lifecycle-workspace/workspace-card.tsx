import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Card shell for workspace panes: optional flex fill + independent vertical scroll in body.
 * Use `fixed` for compact summary cards; omit for list/detail cards that should share column height.
 */
export function WorkspaceCard({
  children,
  className,
  fixed,
}: {
  children: ReactNode;
  className?: string;
  /** Intrinsic height; does not grow to fill column */
  fixed?: boolean;
}) {
  return (
    <article
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:border-border dark:bg-card",
        fixed ? "shrink-0" : "min-h-0 flex-1",
        className,
      )}
    >
      {children}
    </article>
  );
}

export function WorkspaceCardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <header className={cn("shrink-0 px-4 pb-2 pt-4", className)}>{children}</header>;
}

export function WorkspaceCardBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Non-scroll footer inside a card (e.g. pagination) */
export function WorkspaceCardFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <footer className={cn("shrink-0 border-t border-slate-100 px-4 py-2", className)}>{children}</footer>;
}
