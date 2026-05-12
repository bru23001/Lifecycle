import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function EvidenceCenterContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("mx-auto flex min-h-0 w-full max-w-[1920px] flex-1 flex-col overflow-hidden", className)}>{children}</div>;
}
