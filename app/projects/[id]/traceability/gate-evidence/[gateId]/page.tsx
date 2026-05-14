import { GateEvidenceGateDetailView } from "@/components/traceability/gate-evidence-gate-detail-view";
import { loadGateEvidenceGateDetail } from "@/lib/server/gate-evidence-traceability";

export const dynamic = "force-dynamic";

export default async function GateEvidenceGateDetailPage({
  params,
}: {
  params: Promise<{ id: string; gateId: string }>;
}) {
  const { id, gateId } = await params;
  const data = await loadGateEvidenceGateDetail(id, gateId);
  return <GateEvidenceGateDetailView data={data} />;
}
