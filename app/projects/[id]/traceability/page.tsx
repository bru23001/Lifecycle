import { TraceabilityMatrixPage } from "@/components/traceability/traceability-matrix-page";
import { loadTraceabilityMatrix } from "@/lib/server/traceability";
import { parseWorkspacePhaseQueryParam } from "@/lib/workspace-phase-query";

export const dynamic = "force-dynamic";

function searchParamFirst(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function TraceabilityMatrixRoutePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ phase?: string | string[] }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const phase = parseWorkspacePhaseQueryParam(searchParamFirst(sp.phase));
  const data = await loadTraceabilityMatrix(id, { initialWorkspacePhase: phase });
  return <TraceabilityMatrixPage initial={data} />;
}
