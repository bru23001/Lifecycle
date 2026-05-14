"use client";

import { Button } from "@/components/ui/button";

export function PhasePackageExportButton({ exportPayload }: { exportPayload: unknown }) {
  function download() {
    const body = JSON.stringify(exportPayload, null, 2);
    const blob = new Blob([body], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "phase-package.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button type="button" variant="outline" data-testid="export-phase-package" onClick={download}>
      Export phase package
    </Button>
  );
}
