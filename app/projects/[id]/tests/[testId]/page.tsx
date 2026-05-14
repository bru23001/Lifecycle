import { notFound } from "next/navigation";

import { TraceabilityLinkDetailView } from "@/components/traceability/traceability-link-detail-view";
import { getTraceabilityLinkDetail, getTraceabilityShell } from "@/lib/server/traceability";

export default async function TestTraceLinkDetailPage({
  params,
}: {
  params: Promise<{ id: string; testId: string }>;
}) {
  const { id, testId } = await params;
  const [shell, detail] = await Promise.all([getTraceabilityShell(id), getTraceabilityLinkDetail(id, testId)]);
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
      entryContext="requirement-tests"
    />
  );
}
