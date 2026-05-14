import { redirect } from "next/navigation";

/** Canonical project root: Evidence Center (workspace shell entry is evidence-first in this build). */
export default async function ProjectRootPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/projects/${id}/evidence`);
}
