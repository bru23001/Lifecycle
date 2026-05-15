import { notFound } from "next/navigation";

import { EvidencePreviewRoute } from "@/components/evidence-center/evidence-preview-route";
import { loadEvidenceCenterData } from "@/lib/server/evidence";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string; evidenceId: string }>;
};

export default async function ProjectEvidencePreviewPage({
  params,
}: PageProps) {
  const { id, evidenceId } = await params;
  const data = await loadEvidenceCenterData(id, evidenceId);
  const pkg = data.evidencePackages[evidenceId];
  if (!pkg) {
    notFound();
  }

  return (
    <EvidencePreviewRoute
      projectId={data.project.id}
      projectName={data.project.name}
      projectCurrentPhase={data.project.currentPhase}
      user={data.user}
      selectedEvidence={pkg}
    />
  );
}
