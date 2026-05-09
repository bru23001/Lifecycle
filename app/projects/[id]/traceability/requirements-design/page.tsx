import { TraceabilityMatrixPage } from "@/components/traceability/traceability-matrix-page";
import { buildTraceabilityMatrixInitial } from "@/lib/traceability-matrix-initial";

export default async function RequirementsDesignTraceabilityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const initial = buildTraceabilityMatrixInitial(id, "requirements");
  return <TraceabilityMatrixPage initial={initial} />;
}
