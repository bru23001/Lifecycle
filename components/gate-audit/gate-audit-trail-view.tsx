"use client";

import type { GateAuditTrailViewData } from "@/types/gate-audit.types";
import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { GateAuditTrailPanel } from "@/components/gate-audit/gate-audit-trail-panel";

export function GateAuditTrailView({
  data,
  user,
  initialOpenEventId,
}: {
  data: GateAuditTrailViewData;
  user: { initials: string; name: string; role: string };
  /** From `?openAuditEvent=` deep link. */
  initialOpenEventId?: string | null;
}) {
  const reviewHref = `/projects/${data.projectId}/gates/${data.gateId}/review`;

  return (
    <AuthenticatedAppShell
      projectId={data.projectId}
      projectName={data.projectName}
      phaseSummary={`Gate ${data.gateCode} audit trail`}
      navActive="gates"
      gatesHref={`/projects/${data.projectId}/gates`}
    >
      <TopHeader title="Gate audit trail" userInitials={user.initials} userName={user.name} userRole={user.role} />
      <div className="mx-auto w-full max-w-[1200px] px-5 py-6 min-[901px]:px-8">
        <Breadcrumbs
          items={[
            { label: "Projects", href: "/projects" },
            { label: data.projectName, href: `/projects/${data.projectId}` },
            { label: "Gates", href: `/projects/${data.projectId}/gates` },
            { label: "Gate review", href: reviewHref },
            { label: "Audit trail" },
          ]}
        />
        <GateAuditTrailPanel
          data={data}
          reviewHref={reviewHref}
          initialOpenEventId={initialOpenEventId}
          variant="page"
        />
      </div>
    </AuthenticatedAppShell>
  );
}
