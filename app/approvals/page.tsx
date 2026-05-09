import { ApprovalCenterPage } from "@/components/approval-center/approval-center-page";
import { loadApprovalCenterData } from "@/lib/server/approvals";

export default async function ApprovalsPage() {
  const data = await loadApprovalCenterData();
  return <ApprovalCenterPage initial={data} />;
}
