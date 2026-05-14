import { notFound, redirect } from "next/navigation";

import ArtifactLibraryEmpty from "@/components/artifact-library/artifact-library-empty";
import {
  getDefaultArtifactIdForLibrary,
  loadArtifactLibraryEmptyProject,
} from "@/lib/server/artifact-library-screen";
import { parseWorkspacePhaseQueryParam } from "@/lib/workspace-phase-query";

export const dynamic = "force-dynamic";

function searchParamFirst(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProjectArtifactsIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ phase?: string | string[] }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const phase = parseWorkspacePhaseQueryParam(searchParamFirst(sp.phase));
  const firstId = await getDefaultArtifactIdForLibrary(id, { workspacePhase: phase });
  if (firstId) {
    const q = phase !== undefined ? `?phase=${phase}` : "";
    redirect(`/projects/${id}/artifacts/${firstId}${q}`);
  }
  const ctx = await loadArtifactLibraryEmptyProject(id);
  if (!ctx) {
    notFound();
  }
  return <ArtifactLibraryEmpty user={ctx.user} project={ctx.project} openedFromWorkspacePhase={phase} />;
}
