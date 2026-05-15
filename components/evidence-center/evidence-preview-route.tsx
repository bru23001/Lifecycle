"use client";

import { useRouter } from "next/navigation";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { projectOverviewHref } from "@/lib/projects-url";
import type { EvidenceCenterSelectedEvidence } from "@/types/evidence-center.types";

import { EvidencePreviewModal } from "./evidence-preview-modal";

export type EvidencePreviewRouteProps = {
  projectId: string;
  projectName: string;
  projectCurrentPhase: number;
  user: { name: string; role: string; initials: string };
  selectedEvidence: EvidenceCenterSelectedEvidence;
};

export function EvidencePreviewRoute({
  projectId,
  projectName,
  projectCurrentPhase,
  user,
  selectedEvidence,
}: EvidencePreviewRouteProps) {
  const router = useRouter();
  const navPhaseScope = projectCurrentPhase;
  const evidenceId = selectedEvidence.detail.id;
  const evidenceListHref = `/projects/${projectId}/evidence`;
  const evidenceDetailHref = `/projects/${projectId}/evidence/${evidenceId}`;

  return (
    <AuthenticatedAppShell
      projectId={projectId}
      projectName={projectName}
      phaseSummary={`Evidence preview · ${selectedEvidence.detail.evidenceCode}`}
      phaseProgressPct={selectedEvidence.completeness.overallPercent}
      navActive="evidence"
      projectCurrentPhase={projectCurrentPhase}
      navPhaseScope={navPhaseScope}
      workspaceHref={`/projects/${projectId}/workspace?phase=${navPhaseScope}`}
    >
      <TopHeader
        title="Evidence preview"
        userInitials={user.initials}
        userName={user.name}
        userRole={user.role}
      />

      <main
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-[var(--app-bg)] px-5 py-6 min-[901px]:px-8"
        data-testid="evidence-preview-page"
      >
        <div className="mx-auto w-full max-w-[1280px]">
          <Breadcrumbs
            items={[
              { label: "Projects", href: "/projects" },
              { label: projectName, href: projectOverviewHref(projectId) },
              { label: "Evidence", href: evidenceListHref },
              {
                label: `${selectedEvidence.detail.evidenceCode}`,
                href: evidenceDetailHref,
              },
              { label: "Preview" },
            ]}
          />
          <div className="mt-6">
            <EvidencePreviewModal
              open
              presentation="page"
              selectedEvidence={selectedEvidence}
              onClose={() => router.push(evidenceDetailHref)}
            />
          </div>
        </div>
      </main>
    </AuthenticatedAppShell>
  );
}
