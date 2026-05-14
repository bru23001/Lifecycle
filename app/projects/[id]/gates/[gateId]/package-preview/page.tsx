import { notFound } from "next/navigation";

import { GatePackagePreviewScreen } from "@/components/gate-review/gate-package-preview-screen";
import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { displayFromCurrentUser, getCurrentUser } from "@/lib/server/current-user";
import { loadGateReviewData } from "@/lib/server/gate-review";
import { normalizeGateParam } from "@/lib/gateNormalize";

export const dynamic = "force-dynamic";

export default async function GatePackagePreviewPage({
  params,
}: {
  params: Promise<{ id: string; gateId: string }>;
}) {
  const { id, gateId } = await params;
  const gate = normalizeGateParam(gateId);
  if (!gate) notFound();

  const data = await loadGateReviewData(id, gateId);
  const userDisplay = displayFromCurrentUser(await getCurrentUser());
  const phasePct = Math.min(100, Math.max(10, Math.round(data.gateOverview.phaseProgressPercent)));

  return (
    <AuthenticatedAppShell
      projectId={data.project.id}
      projectName={data.project.name}
      phaseSummary={`Gate ${data.gateReviewHeader.gateCode} preview`}
      phaseProgressPct={phasePct}
      navActive="lifecycle"
      projectCurrentPhase={data.gateReviewHeader.phaseNumber}
    >
      <TopHeader
        title="Gate package preview"
        userInitials={userDisplay.initials}
        userName={userDisplay.name}
        userRole={userDisplay.role}
      />
      <main className="mx-auto w-full max-w-[1920px] flex-1 overflow-y-auto bg-[var(--app-bg)] px-5 py-6">
        <Breadcrumbs
          items={[
            { label: "Projects", href: "/projects" },
            { label: data.project.name, href: `/projects/${data.project.id}/workspace` },
            { label: `Gate ${data.gateReviewHeader.gateCode}`, href: `/projects/${data.project.id}/gates/${data.gateReviewHeader.gateId}/review` },
            { label: "Package preview" },
          ]}
        />
        <div className="mt-6">
          <GatePackagePreviewScreen data={data} />
        </div>
      </main>
    </AuthenticatedAppShell>
  );
}
