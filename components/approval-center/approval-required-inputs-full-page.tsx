"use client";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { RequiredInputsBlock } from "@/components/approval-center/required-inputs-block";
import { NOTIFICATIONS_HUB_HREF } from "@/lib/notifications-hub";
import type { ApprovalCenterData } from "@/types/approval-center.types";

export function ApprovalRequiredInputsFullPage({ data }: { data: ApprovalCenterData }) {
  const pkg = data.selectedApproval;
  const d = pkg.detail;

  return (
    <AuthenticatedAppShell
      projectId={d.projectId || null}
      projectName={d.projectName}
      phaseSummary="Required inputs for approval package"
      phaseProgressPct={undefined}
      navActive="approvals"
    >
      <TopHeader
        title="Approval required inputs"
        userInitials={data.user.initials}
        userName={data.user.name}
        userRole={data.user.role}
        notificationCount={Math.min(data.pendingApprovals.length, 9)}
        notificationHref={NOTIFICATIONS_HUB_HREF}
      />

      <main className="mx-auto w-full max-w-[1200px] flex-1 overflow-y-auto bg-[var(--app-bg)] px-5 py-6 min-[901px]:px-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/dashboard" },
            { label: "Approval Center", href: "/approvals" },
            { label: "Approval", href: `/approvals/${d.id}` },
            { label: "Required inputs" },
          ]}
        />

        <section className="mt-6 rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
          <RequiredInputsBlock
            approvalId={d.id}
            detail={d}
            requiredInputs={pkg.requiredInputs}
            isLoading={false}
            variant="full"
          />
        </section>
      </main>
    </AuthenticatedAppShell>
  );
}
