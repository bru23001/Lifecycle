import { GateEvidenceGateDetailPage } from "@/components/traceability/gate-evidence-gate-detail-page";
import { loadGateEvidenceGateDetail } from "@/lib/server/gate-evidence-traceability";
import { resolveProjectIdFromRouteParam } from "@/lib/server/project-resolve";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function GateEvidenceGateDetailRoutePage({
  params,
}: {
  params: Promise<{ id: string; gateId: string }>;
}) {
  const { id, gateId } = await params;
  const resolved = await resolveProjectIdFromRouteParam(id);
  if (!resolved) notFound();
  const data = await loadGateEvidenceGateDetail(resolved, gateId);
  return <GateEvidenceGateDetailPage data={data} />;
}
