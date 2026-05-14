import { notFound } from "next/navigation";

import { NextPhaseWorkspaceRoute } from "@/components/lifecycle-workspace/next-phase-workspace-route";
import { getCurrentUserDisplay } from "@/lib/server/current-user";
import { loadNextPhaseWorkspaceView } from "@/lib/server/next-phase-workspace";

export const dynamic = "force-dynamic";

export default async function ProjectWorkspacePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ phase?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const data = await loadNextPhaseWorkspaceView(id, sp.phase);
  if (!data) {
    notFound();
  }
  const user = await getCurrentUserDisplay();
  return <NextPhaseWorkspaceRoute data={data} user={user} />;
}
