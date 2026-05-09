import { TraceabilityMatrixPage } from "@/components/traceability/traceability-matrix-page";
import { buildTraceabilityMatrixInitial } from "@/lib/traceability-matrix-initial";

export default async function PhaseEvidenceTraceabilityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const initial = buildTraceabilityMatrixInitial(id, "phases");
  return <TraceabilityMatrixPage initial={initial} />;
}
