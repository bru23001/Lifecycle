import { ArtifactLibraryPage } from "@/components/artifact-library/artifact-library-page";
import { loadArtifactLibraryData } from "@/lib/server/artifact-library";

export default async function ArtifactLibraryRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadArtifactLibraryData(id);
  return <ArtifactLibraryPage data={data} />;
}
