import { ApprovalCenterPage } from "@/components/approval-center/approval-center-page";
import { loadApprovalCenterData } from "@/lib/server/approvals";

export default async function ApprovalByIdPage({
  params,
}: {
  params: Promise<{ approvalId: string }>;
}) {
  const { approvalId } = await params;
  const data = await loadApprovalCenterData(approvalId);
  return <ApprovalCenterPage initial={data} />;
}
