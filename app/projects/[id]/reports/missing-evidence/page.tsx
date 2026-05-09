import { redirect } from "next/navigation";

/** Legacy route: missing-evidence analysis is part of Evidence Completeness Report (UI-UX §20). */
export default async function MissingEvidenceReportRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/projects/${id}/reports/evidence-completeness`);
}
