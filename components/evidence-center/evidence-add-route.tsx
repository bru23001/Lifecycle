"use client";

import { useRouter } from "next/navigation";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { projectOverviewHref } from "@/lib/projects-url";

import {
  AddEvidenceModal,
  type AddEvidenceLinkedArtifactOption,
} from "./add-evidence-modal";

export type EvidenceAddRouteProps = {
  projectId: string;
  projectName: string;
  projectCurrentPhase: number;
  user: { name: string; role: string; initials: string };
  artifactOptions: AddEvidenceLinkedArtifactOption[];
};

export function EvidenceAddRoute({
  projectId,
  projectName,
  projectCurrentPhase,
  user,
  artifactOptions,
}: EvidenceAddRouteProps) {
  const router = useRouter();
  const navPhaseScope = projectCurrentPhase;

  return (
    <AuthenticatedAppShell
      projectId={projectId}
      projectName={projectName}
      phaseSummary="Add evidence"
      phaseProgressPct={0}
      navActive="evidence"
      projectCurrentPhase={projectCurrentPhase}
      navPhaseScope={navPhaseScope}
      workspaceHref={`/projects/${projectId}/workspace?phase=${navPhaseScope}`}
    >
      <TopHeader
        title="Add Evidence"
        userInitials={user.initials}
        userName={user.name}
        userRole={user.role}
      />

      <main
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-[var(--app-bg)] px-5 py-6 min-[901px]:px-8"
        data-testid="evidence-add-page"
      >
        <div className="mx-auto w-full max-w-[960px]">
          <Breadcrumbs
            items={[
              { label: "Projects", href: "/projects" },
              { label: projectName, href: projectOverviewHref(projectId) },
              { label: "Evidence", href: `/projects/${projectId}/evidence` },
              { label: "Add" },
            ]}
          />
          <div className="mt-6">
            <AddEvidenceModal
              open
              presentation="page"
              projectId={projectId}
              artifactOptions={artifactOptions}
              onClose={() => router.push(`/projects/${projectId}/evidence`)}
              onSuccess={(evidenceId) =>
                router.push(`/projects/${projectId}/evidence/${evidenceId}`)
              }
            />
          </div>
        </div>
      </main>
    </AuthenticatedAppShell>
  );
}
