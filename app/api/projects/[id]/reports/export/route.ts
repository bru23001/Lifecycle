import { NextResponse } from "next/server";

import {
  applyEvidencePackageScopesToReport,
  clampEvidencePackageScopesToAvailability,
  parseEvidencePackageScopesFromSearchParams,
} from "@/lib/evidence-package-scopes";
import { reportsFiltersFromSearchParams } from "@/lib/reports-url";
import { loadReportsPageData } from "@/lib/server/reports";
import type { ReportsPageData } from "@/types/reports.types";

function pickReportPayload(
  data: ReportsPageData,
  key: string,
  searchParams: Record<string, string | string[] | undefined>,
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
    case "fullProjectEvidencePackage": {
      const report = data.reports.fullProjectEvidencePackage;
      const scopes = clampEvidencePackageScopesToAvailability(
        parseEvidencePackageScopesFromSearchParams(searchParams, report),
        report,
      );
      return {
        ...base,
        packageScopes: scopes,
        report: applyEvidencePackageScopesToReport(report, scopes),
      };
    }
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
  const format = (url.searchParams.get("format") ?? "json").toLowerCase();

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
  const allowedFormats = new Set(["json", "pdf", "csv", "zip"]);
  if (!allowedFormats.has(format)) {
    return NextResponse.json({ error: `Unknown export format: ${format}` }, { status: 400 });
  }

  const sp: Record<string, string | string[] | undefined> = {};
  url.searchParams.forEach((value, k) => {
    sp[k] = value;
  });
  const filters = reportsFiltersFromSearchParams(id, sp);

  try {
    const data = await loadReportsPageData(id, filters);
    const payload = pickReportPayload(data, key, sp);
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
        "Content-Disposition": `attachment; filename="report-${key}.${format}"`,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Export failed";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
