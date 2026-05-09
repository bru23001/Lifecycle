import { EvidenceCenterPage } from "@/components/evidence-center/evidence-center-page";
import { loadEvidenceCenterData } from "@/lib/server/evidence";

export default async function EvidenceCenterByIdRoutePage({
  params,
}: {
  params: Promise<{ id: string; evidenceId: string }>;
}) {
  const { id, evidenceId } = await params;
  const data = await loadEvidenceCenterData(id, evidenceId);
  return <EvidenceCenterPage initial={data} selectedEvidenceId={evidenceId} />;
}
