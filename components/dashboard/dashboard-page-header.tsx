import Link from "next/link";
import { Settings } from "lucide-react";

export function DashboardPageHeader({
  reportsHubHref,
}: {
  /** Lead project reports hub; when set, shows a reports shortcut under the intro line. */
  reportsHubHref?: string | null;
}) {
  return (
    <div className="min-w-0">
      <p className="m-0 text-[13px] text-slate-500">
        Here&apos;s what&apos;s happening with your lifecycle projects.
      </p>
      <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
        <Link
          href="/approvals"
          className="text-[12px] font-semibold text-[#2563eb] hover:underline"
        >
          View Approval Center
        </Link>
        <Link
          href="/settings/lifecycle"
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#2563eb] hover:underline"
          data-testid="dashboard-settings-shortcut"
        >
          <Settings className="size-3.5 shrink-0" aria-hidden />
          Settings
        </Link>
        {reportsHubHref ? (
          <Link
            href={reportsHubHref}
            className="text-[12px] font-semibold text-[#2563eb] hover:underline"
            data-testid="dashboard-reports-shortcut"
          >
            Open Reports
          </Link>
        ) : null}
      </p>
    </div>
  );
}
