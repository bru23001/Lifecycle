import { GateEvidenceTraceabilityListView } from "@/components/traceability/gate-evidence-traceability-list-view";
import { loadGateEvidenceTraceabilityList } from "@/lib/server/gate-evidence-traceability";

export const dynamic = "force-dynamic";

export default async function GateEvidenceTraceabilityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadGateEvidenceTraceabilityList(id);
  return <GateEvidenceTraceabilityListView data={data} />;
}
