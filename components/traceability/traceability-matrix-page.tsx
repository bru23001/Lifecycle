"use client";

import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { exportTraceabilityMatrix } from "@/lib/traceability-export";
import type { TraceabilityMatrixData } from "@/types/traceability.types";

import { TraceabilityContent } from "./traceability-content";

export function TraceabilityMatrixPage({ initial }: { initial: TraceabilityMatrixData }) {
  return (
    <AuthenticatedAppShell
      projectId={initial.project.id}
      projectName={initial.project.name}
      phaseSummary="Traceability matrix coverage"
      phaseProgressPct={initial.coverageSummary.overallCoveragePercent}
      navActive="traceability"
    >
      <TopHeader
        title="Traceability Matrix"
        userInitials={initial.user.initials}
        notificationCount={6}
        actionButtonLabel="Export Matrix"
        actionButtonAriaLabel="Export traceability matrix"
        onActionButtonClick={() => exportTraceabilityMatrix(initial, "csv")}
      />
      <main className="traceability-matrix flex min-h-0 flex-1 flex-col overflow-y-auto bg-[var(--app-bg)] px-5 pb-8 pt-4 min-[901px]:px-8">
        <div className="mx-auto w-full max-w-[1920px]">
          <Breadcrumbs
            items={[
              { label: "Projects", href: "/projects" },
              { label: `${initial.project.name} (${initial.project.code})`, href: `/projects/${initial.project.id}` },
              { label: "Traceability Matrix" },
            ]}
          />
          <TraceabilityContent data={initial} />
        </div>
      </main>
    </AuthenticatedAppShell>
  );
}
