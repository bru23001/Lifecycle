import { notFound } from "next/navigation";

import { PhaseEvidenceMatrixPage } from "@/components/traceability/phase-evidence-matrix-page";
import { loadPhaseEvidenceTraceabilityList } from "@/lib/server/phase-evidence-traceability";
import { resolveProjectIdFromRouteParam } from "@/lib/server/project-resolve";

export const dynamic = "force-dynamic";

export default async function PhaseEvidenceMatrixRoutePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const resolved = await resolveProjectIdFromRouteParam(id);
  if (!resolved) notFound();
  const data = await loadPhaseEvidenceTraceabilityList(resolved);
  return <PhaseEvidenceMatrixPage data={data} />;
}
