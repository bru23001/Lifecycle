import { redirect } from "next/navigation";

/**
 * Legacy route. Evidence-completeness analysis is now consolidated into the
 * Missing Evidence Report per the Reports spec (six-report dashboard).
 */
export default async function EvidenceCompletenessReportRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/projects/${id}/reports/missing-evidence`);
}
