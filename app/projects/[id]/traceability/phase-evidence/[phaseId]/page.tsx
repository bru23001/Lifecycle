import { notFound } from "next/navigation";

import { PhaseEvidencePhaseDetailPage } from "@/components/traceability/phase-evidence-phase-detail-page";
import { loadPhaseEvidencePhaseDetail } from "@/lib/server/phase-evidence-traceability";
import { resolveProjectIdFromRouteParam } from "@/lib/server/project-resolve";

export const dynamic = "force-dynamic";

export default async function PhaseEvidencePhaseDetailRoutePage({
  params,
}: {
  params: Promise<{ id: string; phaseId: string }>;
}) {
  const { id, phaseId } = await params;
  const resolved = await resolveProjectIdFromRouteParam(id);
  if (!resolved) notFound();
  const data = await loadPhaseEvidencePhaseDetail(resolved, phaseId);
  return <PhaseEvidencePhaseDetailPage data={data} />;
}
