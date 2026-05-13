import Link from "next/link";
import { Bell, FileText, History, Shield } from "lucide-react";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { NOTIFICATIONS_HUB_HREF } from "@/lib/notifications-hub";
import type { NotificationCenterData, NotificationCenterItem } from "@/types/notification-center.types";
import { cn } from "@/lib/utils";

function ItemIcon({ kind }: { kind: NotificationCenterItem["kind"] }) {
  const Icon = kind === "approval_pending" ? FileText : kind === "gate_event" ? Shield : History;
  return (
    <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
      <Icon className="size-5" aria-hidden />
    </div>
  );
}

export function NotificationCenterPage({ data }: { data: NotificationCenterData }) {
  const badgeCount = data.openApprovalsCount > 0 ? Math.min(data.openApprovalsCount, 9) : 0;

  return (
    <AuthenticatedAppShell navActive="notifications">
      <TopHeader
        title="Notifications"
        userInitials={data.user.initials}
        userName={data.user.name}
        userRole={data.user.role}
        notificationCount={badgeCount}
        notificationHref={NOTIFICATIONS_HUB_HREF}
      />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto bg-[var(--app-bg)] text-foreground">
        <div className="mx-auto w-full max-w-[960px] shrink-0 px-5 pb-4 pt-4 min-[901px]:px-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/dashboard" },
              { label: "Notifications" },
            ]}
          />
        </div>

        <div className="mx-auto w-full max-w-[960px] flex-1 px-5 pb-10 min-[901px]:px-8">
          {data.items.length === 0 ? (
            <div className="cc-card-standard flex flex-col items-center gap-4 p-10 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                <Bell className="size-7" aria-hidden />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold tracking-tight">You&apos;re caught up</h2>
                <p className="text-sm text-muted-foreground">
                  No pending approvals or recent lifecycle notifications. Open a project workspace or the approval center
                  to generate activity.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/approvals"
                  className="inline-flex h-10 items-center rounded-md bg-[#2563eb] px-4 text-sm font-semibold text-white hover:opacity-95"
                >
                  Approval Center
                </Link>
                <Link href="/projects" className="inline-flex h-10 items-center rounded-md border px-4 text-sm font-semibold hover:bg-muted">
                  Projects
                </Link>
              </div>
            </div>
          ) : (
            <ul className="divide-y rounded-xl border border-slate-200 bg-card shadow-sm dark:border-[var(--cc-border)]">
              {data.items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-start gap-4 px-5 py-4 transition hover:bg-muted/60",
                      item.kind === "approval_pending" && "bg-amber-50/40 dark:bg-amber-950/15",
                    )}
                  >
                    <ItemIcon kind={item.kind} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="mt-0.5 text-sm text-muted-foreground">{item.subtitle}</p>
                    </div>
                    <time className="shrink-0 text-xs font-medium text-muted-foreground">{item.timeLabel}</time>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </AuthenticatedAppShell>
  );
}
