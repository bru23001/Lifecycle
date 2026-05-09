import { reportsFiltersToSearchParams } from "@/lib/reports-url";
import type { ReportsPageData } from "@/types/reports.types";

function triggerDownload(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportSingleReport(
  data: ReportsPageData,
  reportKey:
    | "lifecycleStatus"
    | "gateDecision"
    | "artifactCompletion"
    | "evidenceCompleteness"
    | "traceability"
    | "approvalHistory"
    | "fullProjectEvidencePackage",
): Promise<void> {
  const baseQs = new URLSearchParams({ key: reportKey });
  const filterQs = reportsFiltersToSearchParams(data.filters).toString();
  const query = [baseQs.toString(), filterQs].filter(Boolean).join("&");

  const res = await fetch(`/api/projects/${data.project.id}/reports/export?${query}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(err?.error ?? `Export failed (${res.status})`);
  }

  const text = await res.text();
  triggerDownload(
    `${data.project.code.toLowerCase()}-${reportKey}.json`,
    text,
    "application/json",
  );
}

export async function exportAllReports(data: ReportsPageData): Promise<void> {
  const baseQs = new URLSearchParams({ key: "all" });
  const filterQs = reportsFiltersToSearchParams(data.filters).toString();
  const query = [baseQs.toString(), filterQs].filter(Boolean).join("&");

  const res = await fetch(`/api/projects/${data.project.id}/reports/export?${query}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(err?.error ?? `Export failed (${res.status})`);
  }

  const text = await res.text();
  triggerDownload(
    `${data.project.code.toLowerCase()}-all-reports.json`,
    text,
    "application/json",
  );
}
