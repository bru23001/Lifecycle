import { notFound } from "next/navigation";

import { FullApprovalHistoryPage } from "@/components/approval-center/full-approval-history-page";
import { loadApprovalCenterData } from "@/lib/server/approvals";

export default async function ApprovalHistoryRoutePage({
  params,
}: {
  params: Promise<{ approvalId: string }>;
}) {
  const { approvalId } = await params;
  const data = await loadApprovalCenterData(approvalId);
  if (!(approvalId in data.approvalPackages)) {
    notFound();
  }
  const pkg = data.approvalPackages[approvalId]!;
  return (
    <FullApprovalHistoryPage
      approvalId={approvalId}
      pkg={pkg}
      user={data.user}
      notificationCount={Math.min(data.pendingApprovals.length, 9)}
    />
  );
}
