import { redirect } from "next/navigation";

import { loadApprovalCenterData } from "@/lib/server/approvals";

export default async function ApprovalsIndexPage() {
  const data = await loadApprovalCenterData();
  redirect(`/approvals/${data.selectedApproval.detail.id}`);
}
