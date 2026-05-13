import { notFound, redirect } from "next/navigation";

import { ArtifactLibraryPage } from "@/components/artifact-library/artifact-library-page";
import { prisma } from "@/lib/prisma";
import { loadArtifactLibraryScreenData } from "@/lib/server/artifact-library-screen";

export const dynamic = "force-dynamic";

export default async function ProjectArtifactDetailPage({
  params,
}: {
  params: Promise<{ id: string; artifactId: string }>;
}) {
  const { id, artifactId } = await params;

  const counts = await prisma.project.findUnique({
    where: { id },
    select: { _count: { select: { artifacts: true } } },
  });
  if (!counts) {
    notFound();
  }

  const data = await loadArtifactLibraryScreenData(id, artifactId);
  if (!data) {
    if (counts._count.artifacts === 0) {
      redirect(`/projects/${id}/artifacts`);
    }
    notFound();
  }

  return <ArtifactLibraryPage data={data} selectedArtifactId={artifactId} view="detail" />;
}
