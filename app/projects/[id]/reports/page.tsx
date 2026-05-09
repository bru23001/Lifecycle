import { ReportsPage } from "@/components/reports/reports-page";
import { reportsFiltersFromSearchParams } from "@/lib/reports-url";
import { loadReportsPageData } from "@/lib/server/reports";

export default async function ReportsRoutePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const filters = reportsFiltersFromSearchParams(id, sp);
  const data = await loadReportsPageData(id, filters);
  return <ReportsPage initial={data} />;
}
