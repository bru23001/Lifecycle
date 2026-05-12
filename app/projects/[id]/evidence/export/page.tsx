import { EvidenceExportPage } from "@/components/evidence-center/evidence-export-page";
import { loadEvidenceCenterData } from "@/lib/server/evidence";

export default async function EvidenceExportRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadEvidenceCenterData(id);
  return <EvidenceExportPage data={data} />;
}
