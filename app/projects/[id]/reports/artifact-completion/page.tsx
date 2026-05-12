import { redirect } from "next/navigation";

/**
 * Legacy route. Artifact-completion analysis is now folded into the Missing
 * Evidence Report per the Reports spec (six-report dashboard).
 */
export default async function ArtifactCompletionReportRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/projects/${id}/reports/missing-evidence`);
}
