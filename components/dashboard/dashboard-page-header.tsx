import Link from "next/link";
import { Plus, Settings } from "lucide-react";

export function DashboardPageHeader({
  userName,
  reportsHubHref,
}: {
  userName: string;
  /** Lead project reports hub; when set, shows a reports shortcut under the welcome line. */
  reportsHubHref?: string | null;
}) {
  const displayName = userName.trim() || "there";
  return (
    <section className="span-12 flex flex-col gap-4 min-[901px]:flex-row min-[901px]:items-center min-[901px]:justify-between">
      <div>
        <h1 className="text-[24px] font-bold tracking-[-0.02em]">Welcome back, {displayName}</h1>
        <p className="mt-[5px] text-[13px] text-slate-500">
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
            href="/settings"
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
      <Link
        href="/projects/new"
        className="inline-flex h-[39px] shrink-0 items-center gap-2 self-start rounded-[6px] bg-[#2563eb] px-[18px] text-[12px] font-semibold text-white shadow-sm min-[901px]:self-auto"
      >
        <Plus className="size-[15px]" aria-hidden />
        New Project
      </Link>
    </section>
  );
}
