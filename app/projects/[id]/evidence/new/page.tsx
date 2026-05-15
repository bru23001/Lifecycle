import { EvidenceAddRoute } from "@/components/evidence-center/evidence-add-route";
import { loadEvidenceCenterData } from "@/lib/server/evidence";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProjectEvidenceNewPage({ params }: PageProps) {
  const { id } = await params;
  const data = await loadEvidenceCenterData(id);
  const artifactOptions = data.linkableArtifacts.map((a) => ({
    id: a.id,
    label: a.label,
  }));

  return (
    <EvidenceAddRoute
      projectId={data.project.id}
      projectName={data.project.name}
      projectCurrentPhase={data.project.currentPhase}
      user={data.user}
      artifactOptions={artifactOptions}
    />
  );
}
