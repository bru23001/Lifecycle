import type { ReportCardBase } from "@/types/reports.types";

export const reportStatusBadgeMap: Record<
  ReportCardBase["status"],
  { label: string; tone: "green" | "amber" | "blue" | "red" }
> = {
  ready: { label: "Ready", tone: "green" },
  stale: { label: "Stale", tone: "amber" },
  generating: { label: "Generating", tone: "blue" },
  missing: { label: "Missing", tone: "red" },
  error: { label: "Error", tone: "red" },
};

export const reportExportFormatMap = {
  pdf: { label: "PDF", extension: ".pdf" },
  csv: { label: "CSV", extension: ".csv" },
  json: { label: "JSON", extension: ".json" },
  zip: { label: "ZIP Package", extension: ".zip" },
};
