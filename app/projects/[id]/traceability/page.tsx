import { TraceabilityMatrixPage } from "@/components/traceability/traceability-matrix-page";
import { loadTraceabilityMatrix } from "@/lib/server/traceability";

export default async function TraceabilityMatrixRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadTraceabilityMatrix(id);
  return <TraceabilityMatrixPage initial={data} />;
}
