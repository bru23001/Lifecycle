import { ArtifactLibraryPage } from "@/components/artifact-library/artifact-library-page";
import { loadArtifactLibraryData } from "@/lib/server/artifact-library";

export default async function ArtifactLibraryDetailRoutePage({
  params,
}: {
  params: Promise<{ id: string; artifactId: string }>;
}) {
  const { id, artifactId } = await params;
  const data = await loadArtifactLibraryData(id, artifactId);
  return <ArtifactLibraryPage data={data} selectedArtifactId={artifactId} />;
}
