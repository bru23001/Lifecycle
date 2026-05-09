import { buildTraceabilityMatrixMock } from "@/data/traceability.mock";
import type { TraceabilityMatrixData } from "@/types/traceability.types";

export type TraceabilityViewMode = TraceabilityMatrixData["filters"]["viewMode"];

/** Same mock matrix data with a preset filter bar “View mode” for deep links from Evidence Center / matrix cards. */
export function buildTraceabilityMatrixInitial(projectId: string, viewMode: TraceabilityViewMode): TraceabilityMatrixData {
  const data = buildTraceabilityMatrixMock(projectId);
  return {
    ...data,
    filters: {
      ...data.filters,
      viewMode,
    },
  };
}
