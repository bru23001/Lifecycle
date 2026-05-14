import { RequirementTestTraceabilityView } from "@/components/traceability/requirement-test-traceability-view";
import { loadRequirementTestTraceability } from "@/lib/server/requirement-test-traceability";

export const dynamic = "force-dynamic";

function searchParamFirst(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function RequirementsTestsTraceabilityPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const typeRaw = searchParamFirst(sp.type);
  const data = await loadRequirementTestTraceability(id, typeRaw);
  return <RequirementTestTraceabilityView data={data} />;
}
