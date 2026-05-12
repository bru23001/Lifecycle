import { TraceabilityMatrixPage } from "@/components/traceability/traceability-matrix-page";
import { loadTraceabilityMatrixWithView } from "@/lib/server/traceability";

export default async function PhaseEvidenceTraceabilityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const initial = await loadTraceabilityMatrixWithView(id, "phases");
  return <TraceabilityMatrixPage initial={initial} />;
}
