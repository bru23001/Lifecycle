import { notFound } from "next/navigation";

import { ApprovalRequiredInputsFullPage } from "@/components/approval-center/approval-required-inputs-full-page";
import { loadApprovalCenterData } from "@/lib/server/approvals";

export const dynamic = "force-dynamic";

export default async function ApprovalRequiredInputsRoutePage({
  params,
}: {
  params: Promise<{ approvalId: string }>;
}) {
  const { approvalId } = await params;
  const data = await loadApprovalCenterData(approvalId);
  if (!(approvalId in data.approvalPackages)) {
    notFound();
  }
  return <ApprovalRequiredInputsFullPage data={data} />;
}
