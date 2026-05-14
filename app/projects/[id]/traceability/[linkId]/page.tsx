import { notFound } from "next/navigation";

import { TraceabilityLinkDetailView } from "@/components/traceability/traceability-link-detail-view";
import { getTraceabilityLinkDetail, getTraceabilityShell } from "@/lib/server/traceability";

export default async function TraceabilityLinkDetailPage({
  params,
}: {
  params: Promise<{ id: string; linkId: string }>;
}) {
  const { id, linkId } = await params;
  const [shell, detail] = await Promise.all([getTraceabilityShell(id), getTraceabilityLinkDetail(id, linkId)]);
  if (!shell || !detail) notFound();

  return (
    <TraceabilityLinkDetailView
      projectId={id}
      projectName={shell.projectName}
      projectCode={shell.projectCode}
      userInitials={shell.user.initials}
      userName={shell.user.name}
      userRole={shell.user.role}
      phaseProgressPct={shell.phaseProgressPct}
      detail={detail}
    />
  );
}
