import { ChevronRight, Flag } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NextRequiredActionBar({
  label,
  description,
  ctaLabel,
  href,
}: {
  label?: string;
  description: string;
  ctaLabel: string;
  href: string;
}) {
  const heading = label ?? "Next required action";

  return (
    <div className="sticky bottom-0 z-10 mt-2 flex flex-wrap items-center justify-between gap-3 border-t bg-card px-4 py-3">
      <p className="flex min-w-0 flex-1 items-start gap-2 text-sm text-foreground">
        <span className="mt-0.5 inline-flex size-5 items-center justify-center rounded-full bg-[#e7f0ff]">
          <Flag className="size-3.5 shrink-0 text-[#2563eb]" aria-hidden />
        </span>
        <span>
          <span className="font-medium">{heading}:</span> {description}
        </span>
      </p>
      <Link
        href={href}
        className={cn(
          buttonVariants({ variant: "default", size: "default" }),
          "shrink-0 gap-1 bg-[#2563eb] hover:bg-[#1d4ed8]",
        )}
      >
        {ctaLabel}
        <ChevronRight className="size-4" />
      </Link>
    </div>
  );
}
