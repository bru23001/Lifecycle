import { EvidencePackageConfigureForm } from "@/components/reports/evidence-package-configure-form";
import { ReportChrome } from "@/components/reports/report-chrome";
import {
  clampEvidencePackageScopesToAvailability,
  parseEvidencePackageScopesFromSearchParams,
} from "@/lib/evidence-package-scopes";
import { reportsFiltersFromSearchParams } from "@/lib/reports-url";
import { loadReportsPageData } from "@/lib/server/reports";

export default async function EvidencePackageConfigurePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const filters = reportsFiltersFromSearchParams(id, sp);
  const data = await loadReportsPageData(id, filters);
  const summary = data.reports.fullProjectEvidencePackage;
  const initialScopes = clampEvidencePackageScopesToAvailability(
    parseEvidencePackageScopesFromSearchParams(sp, summary),
    summary,
  );
  const initialScopesKey = JSON.stringify(initialScopes);

  return (
    <ReportChrome
      data={data}
      title="Configure Evidence Package"
      description="Choose scopes and payloads to include in the full project lifecycle export bundle."
    >
      <EvidencePackageConfigureForm
        projectId={id}
        filters={data.filters}
        initial={summary}
        initialScopes={initialScopes}
        initialScopesKey={initialScopesKey}
      />
    </ReportChrome>
  );
}
