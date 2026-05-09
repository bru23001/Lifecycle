import { ReportChrome } from "@/components/reports/report-chrome";
import { ScheduleReportsForm } from "@/components/reports/schedule-reports-form";
import { loadReportsPageData } from "@/lib/server/reports";

export default async function ScheduleReportsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadReportsPageData(id);

  return (
    <ReportChrome
      data={data}
      title="Schedule Reports"
      description="Automate recurring generation and delivery of governance reports for this project."
    >
      <ScheduleReportsForm projectId={id} />
    </ReportChrome>
  );
}
