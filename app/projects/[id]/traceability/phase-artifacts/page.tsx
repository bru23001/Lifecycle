import { PhaseArtifactTraceabilityListView } from "@/components/traceability/phase-artifact-traceability-list-view";
import { loadPhaseArtifactTraceabilityList } from "@/lib/server/phase-artifact-traceability";

export const dynamic = "force-dynamic";

export default async function PhaseArtifactsTraceabilityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadPhaseArtifactTraceabilityList(id);
  return <PhaseArtifactTraceabilityListView data={data} />;
}
