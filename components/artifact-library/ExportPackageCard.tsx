"use client";

import { Download } from "lucide-react";

import type { ArtifactExportPackage, ArtifactJsonEvidence } from "@/types/artifact-library.types";
import { cn } from "@/lib/utils";

function downloadText(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportPackageCard({
  exportPackage,
  markdown,
  jsonEvidence,
}: {
  exportPackage: ArtifactExportPackage;
  markdown: string;
  jsonEvidence: ArtifactJsonEvidence;
}) {
  const json = JSON.stringify(jsonEvidence, null, 2);
  return (
    <section className="cc-card-standard p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Export packages</h3>
      <p className="mt-2 text-xs text-muted-foreground">
        Download Markdown, structured JSON evidence, or a simple combined package as JSON (ZIP placeholder).
      </p>
      {exportPackage.blockers.length > 0 ? (
        <ul className="mt-2 space-y-1 text-[11px] text-amber-800">
          {exportPackage.blockers.map((b, i) => (
            <li key={i}>• {b}</li>
          ))}
        </ul>
      ) : null}
      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          disabled={!exportPackage.canExportMarkdown}
          onClick={() => downloadText(exportPackage.markdownFilename, markdown, "text/markdown;charset=utf-8")}
          className={cn(
            "inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-xs font-semibold",
            exportPackage.canExportMarkdown
              ? "bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
              : "cursor-not-allowed bg-muted text-muted-foreground",
          )}
        >
          <Download className="size-3.5" aria-hidden />
          Markdown
        </button>
        <button
          type="button"
          disabled={!exportPackage.canExportJsonEvidence}
          onClick={() => downloadText(exportPackage.jsonFilename, json, "application/json;charset=utf-8")}
          className={cn(
            "inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-background px-3 text-xs font-semibold text-foreground hover:bg-muted/60",
            !exportPackage.canExportJsonEvidence && "cursor-not-allowed opacity-50",
          )}
        >
          <Download className="size-3.5" aria-hidden />
          JSON evidence
        </button>
        <button
          type="button"
          disabled={!exportPackage.canExportFullPackage}
          onClick={() =>
            downloadText(
              exportPackage.packageFilename.replace(/\.zip$/, ".json"),
              JSON.stringify(
                {
                  kind: "lifecycle_export_bundle_v1",
                  artifactId: exportPackage.artifactId,
                  markdownFilename: exportPackage.markdownFilename,
                  jsonFilename: exportPackage.jsonFilename,
                  markdown,
                  json: jsonEvidence,
                },
                null,
                2,
              ),
              "application/json;charset=utf-8",
            )
          }
          className={cn(
            "inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-background px-3 text-xs font-semibold text-foreground hover:bg-muted/60",
            !exportPackage.canExportFullPackage && "cursor-not-allowed opacity-50",
          )}
        >
          <Download className="size-3.5" aria-hidden />
          Full package (JSON)
        </button>
      </div>
    </section>
  );
}
