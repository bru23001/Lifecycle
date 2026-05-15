import Link from "next/link";
import { BarChart3, Inbox, Settings } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DashboardPageHeader({
  reportsHubHref,
}: {
  /** Lead project reports hub; when set, shows a reports shortcut under the intro line. */
  reportsHubHref?: string | null;
}) {
  const chipClass = cn(
    buttonVariants({ variant: "outline", size: "sm" }),
    "h-8 gap-1.5 border-border/90 bg-background/80 px-3 text-[12px] font-semibold shadow-sm hover:bg-muted/80 dark:bg-card/80",
  );

  return (
    <div className="min-w-0">
      <p className="m-0 text-[13px] text-muted-foreground">
        Here&apos;s what&apos;s happening with your lifecycle projects.
      </p>
      <nav
        className="mt-3 flex flex-wrap gap-2 rounded-xl border border-border/80 bg-muted/25 p-2.5 shadow-sm dark:bg-muted/15"
        aria-label="Workspace shortcuts"
      >
        <Link
          href="/approvals"
          className={chipClass}
          data-testid="dashboard-approvals-shortcut"
        >
          <Inbox className="size-3.5 shrink-0 opacity-80" aria-hidden />
          Approval Center
        </Link>
        <Link
          href="/settings/lifecycle"
          className={chipClass}
          data-testid="dashboard-settings-shortcut"
        >
          <Settings className="size-3.5 shrink-0 opacity-80" aria-hidden />
          Settings
        </Link>
        {reportsHubHref ? (
          <Link
            href={reportsHubHref}
            className={chipClass}
            data-testid="dashboard-reports-shortcut"
          >
            <BarChart3 className="size-3.5 shrink-0 opacity-80" aria-hidden />
            Reports
          </Link>
        ) : null}
      </nav>
    </div>
  );
}
