import { notFound, redirect } from "next/navigation";

import ArtifactLibraryEmpty from "@/components/artifact-library/artifact-library-empty";
import {
  getDefaultArtifactIdForLibrary,
  loadArtifactLibraryEmptyProject,
} from "@/lib/server/artifact-library-screen";

export const dynamic = "force-dynamic";

export default async function ProjectArtifactsIndexPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const firstId = await getDefaultArtifactIdForLibrary(id);
  if (firstId) {
    redirect(`/projects/${id}/artifacts/${firstId}`);
  }
  const ctx = await loadArtifactLibraryEmptyProject(id);
  if (!ctx) {
    notFound();
  }
  return <ArtifactLibraryEmpty user={ctx.user} project={ctx.project} />;
}
