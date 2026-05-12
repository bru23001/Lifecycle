import { NextResponse } from "next/server";

import { reportsFiltersFromSearchParams } from "@/lib/reports-url";
import { loadReportsPageData } from "@/lib/server/reports";
import type { ReportsPageData } from "@/types/reports.types";

function pickReportPayload(
  data: ReportsPageData,
  key: string,
): Record<string, unknown> {
  const base = {
    project: data.project,
    filters: data.filters,
    reportKey: key,
  };
  switch (key) {
    case "lifecycleStatus":
      return { ...base, report: data.reports.lifecycleStatus };
    case "gateDecision":
      return { ...base, report: data.reports.gateDecision };
    case "traceability":
      return { ...base, report: data.reports.traceability };
    case "missingEvidence":
      return { ...base, report: data.reports.missingEvidence };
    case "approvalHistory":
      return { ...base, report: data.reports.approvalHistory };
    case "fullProjectEvidencePackage":
      return { ...base, report: data.reports.fullProjectEvidencePackage };
    case "all":
      return {
        project: data.project,
        filters: data.filters,
        reports: data.reports,
      };
    default:
      return { ...base, report: null, error: `Unknown report key: ${key}` };
  }
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const url = new URL(req.url);
  const key = url.searchParams.get("key") ?? "lifecycleStatus";

  const allowedKeys = new Set([
    "lifecycleStatus",
    "gateDecision",
    "traceability",
    "missingEvidence",
    "approvalHistory",
    "fullProjectEvidencePackage",
    "all",
  ]);
  if (!allowedKeys.has(key)) {
    return NextResponse.json({ error: `Unknown report key: ${key}` }, { status: 400 });
  }

  const sp: Record<string, string | string[] | undefined> = {};
  url.searchParams.forEach((value, k) => {
    sp[k] = value;
  });
  const filters = reportsFiltersFromSearchParams(id, sp);

  try {
    const data = await loadReportsPageData(id, filters);
    const payload = pickReportPayload(data, key);
    const body = JSON.stringify(
      {
        ...payload,
        generatedAt: new Date().toISOString(),
      },
      null,
      2,
    );

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="report-${key}.json"`,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
