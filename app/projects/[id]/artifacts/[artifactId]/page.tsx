import { ArtifactLibraryPage } from "@/components/artifact-library/artifact-library-page";
import { buildArtifactLibraryMock } from "@/data/artifact-library.mock";

export default async function ArtifactLibraryDetailRoutePage({
  params,
}: {
  params: Promise<{ id: string; artifactId: string }>;
}) {
  const { id, artifactId } = await params;
  const data = buildArtifactLibraryMock(id, artifactId);
  return <ArtifactLibraryPage data={data} selectedArtifactId={artifactId} />;
}
