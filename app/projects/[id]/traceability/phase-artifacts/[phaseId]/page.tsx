import { PhaseArtifactTraceabilityPhaseDetailView } from "@/components/traceability/phase-artifact-traceability-phase-detail-view";
import { loadPhaseArtifactTraceabilityPhaseDetail } from "@/lib/server/phase-artifact-traceability";

export const dynamic = "force-dynamic";

export default async function PhaseArtifactPhaseDetailPage({
  params,
}: {
  params: Promise<{ id: string; phaseId: string }>;
}) {
  const { id, phaseId } = await params;
  const data = await loadPhaseArtifactTraceabilityPhaseDetail(id, phaseId);
  return <PhaseArtifactTraceabilityPhaseDetailView data={data} />;
}
