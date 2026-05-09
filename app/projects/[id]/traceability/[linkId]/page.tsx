import { notFound } from "next/navigation";

import { TraceabilityLinkDetailView } from "@/components/traceability/traceability-link-detail-view";
import { buildTraceabilityMatrixMock } from "@/data/traceability.mock";
import { getTraceabilityLinkDetail } from "@/data/traceability-link-detail";

export default async function TraceabilityLinkDetailPage({
  params,
}: {
  params: Promise<{ id: string; linkId: string }>;
}) {
  const { id, linkId } = await params;
  const detail = getTraceabilityLinkDetail(id, linkId);
  if (!detail) notFound();

  const matrix = buildTraceabilityMatrixMock(id);

  return (
    <TraceabilityLinkDetailView
      projectId={id}
      projectName={matrix.project.name}
      projectCode={matrix.project.code}
      userInitials={matrix.user.initials}
      phaseProgressPct={matrix.coverageSummary.overallCoveragePercent}
      detail={detail}
    />
  );
}
