"use client";

import { useState } from "react";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { projectOverviewHref } from "@/lib/projects-url";
import type { TraceabilityMatrixData } from "@/types/traceability.types";

import { TraceabilityContent } from "./traceability-content";

export function TraceabilityGapsPage({ initial }: { initial: TraceabilityMatrixData }) {
  const [exportOpen, setExportOpen] = useState(false);
  const phaseScope =
    typeof initial.filters.phaseNumber === "number" && initial.filters.phaseNumber >= 1 && initial.filters.phaseNumber <= 14
      ? initial.filters.phaseNumber
      : initial.project.currentPhase;

  return (
    <AuthenticatedAppShell
      projectId={initial.project.id}
      projectName={initial.project.name}
      phaseSummary="Traceability gaps and orphan records"
      phaseProgressPct={initial.coverageSummary.overallCoveragePercent}
      navActive="traceability"
      projectCurrentPhase={initial.project.currentPhase}
      navPhaseScope={phaseScope}
      workspaceHref={`/projects/${initial.project.id}/workspace?phase=${phaseScope}`}
    >
      <TopHeader
        title="Traceability gaps & orphans"
        userInitials={initial.user.initials}
        userName={initial.user.name}
        userRole={initial.user.role}
        actionButtonLabel="Export Matrix"
        actionButtonAriaLabel="Export traceability matrix"
        onActionButtonClick={() => setExportOpen(true)}
      />
      <main className="traceability-matrix flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--app-bg)] px-5 pb-8 pt-4 min-[901px]:px-8">
        <div className="mx-auto w-full max-w-[1920px]">
          <Breadcrumbs
            items={[
              { label: "Projects", href: "/projects" },
              { label: `${initial.project.name} (${initial.project.code})`, href: projectOverviewHref(initial.project.id) },
              { label: "Traceability Matrix", href: `/projects/${initial.project.id}/traceability` },
              { label: "Gaps & Orphans" },
            ]}
          />
          <p className="mt-3 max-w-3xl text-sm text-slate-600">
            Full list of requirement gaps, design and evidence orphans, and broken trace links. Select a row to open
            details, create links, record an accepted risk, or assign remediation.
          </p>
          <TraceabilityContent data={initial} gapsShowViewAll={false} exportToolbar={{ open: exportOpen, onOpenChange: setExportOpen }} />
        </div>
      </main>
    </AuthenticatedAppShell>
  );
}
