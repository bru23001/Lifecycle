import { reportsFiltersToSearchParams } from "@/lib/reports-url";
import type { ReportsPageData } from "@/types/reports.types";
import type { ReportExportFormat } from "@/types/reports.types";

function triggerDownload(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function sanitizeFilenamePart(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9-_]/g, "-").replace(/-+/g, "-").toLowerCase();
}

function flattenRecord(
  value: unknown,
  prefix = "",
  out: Record<string, string> = {},
): Record<string, string> {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      flattenRecord(entry, `${prefix}[${index}]`, out);
    });
    return out;
  }
  if (value != null && typeof value === "object") {
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      const next = prefix ? `${prefix}.${key}` : key;
      flattenRecord(nested, next, out);
    }
    return out;
  }
  out[prefix || "value"] = value == null ? "" : String(value);
  return out;
}

function quoteCsvCell(raw: string): string {
  return `"${raw.replaceAll('"', '""')}"`;
}

function toCsv(payload: unknown): string {
  if (Array.isArray(payload)) {
    const rows = payload.map((entry) => flattenRecord(entry));
    const headerSet = new Set<string>();
    rows.forEach((row) => {
      Object.keys(row).forEach((key) => headerSet.add(key));
    });
    const headers = Array.from(headerSet);
    const body = rows.map((row) =>
      headers.map((header) => quoteCsvCell(row[header] ?? "")).join(","),
    );
    return [headers.join(","), ...body].join("\n");
  }
  const row = flattenRecord(payload);
  const headers = Object.keys(row);
  const values = headers.map((header) => quoteCsvCell(row[header] ?? ""));
  return [headers.join(","), values.join(",")].join("\n");
}

function renderPdfStub(title: string, payload: unknown): string {
  return [
    `${title}`,
    "",
    "This is a mock PDF export stub generated client-side.",
    "Replace with a server-side PDF generator for production output.",
    "",
    JSON.stringify(payload, null, 2),
  ].join("\n");
}

function renderZipStub(title: string, payload: unknown): string {
  return [
    `${title}`,
    "",
    "This is a mock ZIP export manifest stub generated client-side.",
    "Replace with a backend ZIP bundler for production output.",
    "",
    JSON.stringify(payload, null, 2),
  ].join("\n");
}

function fileMeta(
  basename: string,
  format: ReportExportFormat,
): { filename: string; mime: string } {
  switch (format) {
    case "csv":
      return { filename: `${basename}.csv`, mime: "text/csv;charset=utf-8" };
    case "pdf":
      return { filename: `${basename}.pdf`, mime: "application/pdf" };
    case "zip":
      return { filename: `${basename}.zip`, mime: "application/zip" };
    case "json":
    default:
      return { filename: `${basename}.json`, mime: "application/json;charset=utf-8" };
  }
}

export async function exportSingleReport(
  data: ReportsPageData,
  reportKey:
    | "lifecycleStatus"
    | "gateDecision"
    | "traceability"
    | "missingEvidence"
    | "approvalHistory"
    | "fullProjectEvidencePackage",
  format: ReportExportFormat = "json",
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

  const payload = (await res.json()) as unknown;
  const normalizedCode = sanitizeFilenamePart(data.project.code);
  const normalizedKey = sanitizeFilenamePart(reportKey);
  const basename = `${normalizedCode}-${normalizedKey}`;
  const { filename, mime } = fileMeta(basename, format);

  let content = "";
  switch (format) {
    case "csv":
      content = toCsv(payload);
      break;
    case "pdf":
      content = renderPdfStub(`Report Export: ${reportKey}`, payload);
      break;
    case "zip":
      content = renderZipStub(`Report Package: ${reportKey}`, payload);
      break;
    case "json":
    default:
      content = JSON.stringify(payload, null, 2);
      break;
  }

  triggerDownload(filename, content, mime);
}

export async function exportAllReports(
  data: ReportsPageData,
  format: ReportExportFormat = "zip",
): Promise<void> {
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

  const payload = (await res.json()) as unknown;
  const basename = `${sanitizeFilenamePart(data.project.code)}-all-reports`;
  const { filename, mime } = fileMeta(basename, format);

  let content = "";
  switch (format) {
    case "csv":
      content = toCsv(payload);
      break;
    case "pdf":
      content = renderPdfStub("All Reports Export", payload);
      break;
    case "zip":
      content = renderZipStub("All Reports Package", payload);
      break;
    case "json":
    default:
      content = JSON.stringify(payload, null, 2);
      break;
  }

  triggerDownload(filename, content, mime);
}
