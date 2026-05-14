import { TraceabilityGapsPage } from "@/components/traceability/traceability-gaps-page";
import { loadTraceabilityMatrix } from "@/lib/server/traceability";

export const dynamic = "force-dynamic";

export default async function TraceabilityGapsRoutePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const initial = await loadTraceabilityMatrix(id, { viewMode: "gaps" });
  return <TraceabilityGapsPage initial={initial} />;
}
