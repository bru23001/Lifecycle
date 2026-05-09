import { EvidenceCenterPage } from "@/components/evidence-center/evidence-center-page";
import { loadEvidenceCenterData } from "@/lib/server/evidence";

export default async function EvidenceCenterRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadEvidenceCenterData(id);
  return <EvidenceCenterPage initial={data} />;
}
