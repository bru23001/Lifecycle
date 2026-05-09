import { TraceabilityMatrixPage } from "@/components/traceability/traceability-matrix-page";
import { buildTraceabilityMatrixMock } from "@/data/traceability.mock";

export default async function TraceabilityMatrixRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = buildTraceabilityMatrixMock(id);
  return <TraceabilityMatrixPage initial={data} />;
}
