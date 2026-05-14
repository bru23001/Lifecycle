import { GateEvidenceMatrixPage } from "@/components/traceability/gate-evidence-matrix-page";
import { loadGateEvidenceTraceabilityList } from "@/lib/server/gate-evidence-traceability";
import { resolveProjectIdFromRouteParam } from "@/lib/server/project-resolve";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function GateEvidenceMatrixRoutePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resolved = await resolveProjectIdFromRouteParam(id);
  if (!resolved) notFound();
  const data = await loadGateEvidenceTraceabilityList(resolved);
  return <GateEvidenceMatrixPage data={data} />;
}
