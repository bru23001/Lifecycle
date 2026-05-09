import { EvidencePackageConfigureForm } from "@/components/reports/evidence-package-configure-form";
import { ReportChrome } from "@/components/reports/report-chrome";
import { loadReportsPageData } from "@/lib/server/reports";

export default async function EvidencePackageConfigurePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadReportsPageData(id);

  return (
    <ReportChrome
      data={data}
      title="Configure Evidence Package"
      description="Choose scopes and payloads to include in the full project lifecycle export bundle."
    >
      <EvidencePackageConfigureForm projectId={id} initial={data.reports.fullProjectEvidencePackage} />
    </ReportChrome>
  );
}
