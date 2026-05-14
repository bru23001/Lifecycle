import { notFound } from "next/navigation";

import { ApprovalCenterPage } from "@/components/approval-center/approval-center-page";
import { loadApprovalCenterData } from "@/lib/server/approvals";

export default async function ApprovalRoutePage({ params }: { params: Promise<{ approvalId: string }> }) {
  const { approvalId } = await params;
  const data = await loadApprovalCenterData(approvalId);
  if (!(approvalId in data.approvalPackages)) {
    notFound();
  }
  const selectedApproval = data.approvalPackages[approvalId]!;
  return <ApprovalCenterPage initial={{ ...data, selectedApproval }} />;
}
