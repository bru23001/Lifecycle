"use client";

import { Button } from "@/components/ui/button";

export function PhaseValidationExportButton({
  exportPayload,
  filename = "phase-validation-report.json",
}: {
  exportPayload: unknown;
  filename?: string;
}) {
  function download() {
    const body = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([body], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button type="button" variant="outline" data-testid="export-validation-report" onClick={download}>
      Export validation report
    </Button>
  );
}
