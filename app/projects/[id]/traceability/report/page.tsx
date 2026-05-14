import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { TraceabilityCoverageReportView } from "@/components/traceability/traceability-coverage-report-view";
import { parseCoverageReportMetricId } from "@/lib/traceability-coverage-metrics";
import { listTraceabilityReportSchedules } from "@/lib/server/traceability-report-schedules";
import { loadTraceabilityMatrix } from "@/lib/server/traceability";

export const dynamic = "force-dynamic";

function searchParamFirst(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export default async function TraceabilityReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ metric?: string | string[] }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const [data, scheduleRows] = await Promise.all([loadTraceabilityMatrix(id), listTraceabilityReportSchedules(id)]);
  const initialMetricId = parseCoverageReportMetricId(searchParamFirst(sp.metric));
  const initialSchedules = scheduleRows.map((s) => ({
    id: s.id,
    reportName: s.reportName,
    frequency: s.frequency,
    recipients: s.recipients,
    format: s.format,
    includeGapsOnly: s.includeGapsOnly,
    includeFullMatrix: s.includeFullMatrix,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <AuthenticatedAppShell
      projectId={data.project.id}
      projectName={data.project.name}
      phaseSummary="Traceability report insights"
      phaseProgressPct={data.coverageSummary.overallCoveragePercent}
      navActive="traceability"
    >
      <TopHeader
        title="Traceability Report"
        userInitials={data.user.initials}
        userName={data.user.name}
        userRole={data.user.role}
      />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-[var(--app-bg)] px-5 pb-10 pt-4 min-[901px]:px-8">
        <div className="mx-auto w-full max-w-[1200px] space-y-6">
          <Breadcrumbs
            items={[
              { label: "Projects", href: "/projects" },
              { label: `${data.project.name} (${data.project.code})`, href: `/projects/${data.project.id}/workspace` },
              { label: "Traceability Matrix", href: `/projects/${data.project.id}/traceability` },
              { label: "Coverage report" },
            ]}
          />

          <TraceabilityCoverageReportView
            data={data}
            initialMetricId={initialMetricId}
            projectId={id}
            initialSchedules={initialSchedules}
          />
        </div>
      </main>
    </AuthenticatedAppShell>
  );
}
