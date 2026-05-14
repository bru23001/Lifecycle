import { RequirementDesignTraceabilityView } from "@/components/traceability/requirement-design-traceability-view";
import { loadRequirementDesignTraceability } from "@/lib/server/requirement-design-traceability";

export const dynamic = "force-dynamic";

function searchParamFirst(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function RequirementsDesignTraceabilityPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const typeRaw = searchParamFirst(sp.type);
  const data = await loadRequirementDesignTraceability(id, typeRaw);
  return <RequirementDesignTraceabilityView data={data} />;
}
