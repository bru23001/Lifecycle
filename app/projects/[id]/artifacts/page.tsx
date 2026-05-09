import { ArtifactLibraryPage } from "@/components/artifact-library/artifact-library-page";
import { buildArtifactLibraryMock } from "@/data/artifact-library.mock";

export default async function ArtifactLibraryRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = buildArtifactLibraryMock(id);
  return <ArtifactLibraryPage data={data} />;
}
