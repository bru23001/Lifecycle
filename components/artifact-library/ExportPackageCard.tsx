"use client";

import { FileArchive, FileDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { downloadTextFile } from "@/lib/artifact-export";
import type { ArtifactExportPackage, ArtifactLibraryData } from "@/types/artifact-library.types";

export function ExportPackageCard({
  exportPackage,
  markdown,
  json,
}: {
  exportPackage: ArtifactExportPackage;
  markdown: ArtifactLibraryData["selectedArtifact"]["markdownView"];
  json: ArtifactLibraryData["selectedArtifact"]["jsonEvidence"];
}) {
  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm dark:border-border dark:bg-card">
      <h3 className="text-sm font-semibold text-[#111827] dark:text-foreground">Export Package</h3>
      <p className="mt-2 text-xs text-[#64748b] dark:text-muted-foreground">
        Export this artifact with linked evidence and metadata.
      </p>

      {exportPackage.blockers.length > 0 ? (
        <div role="alert" className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          {exportPackage.blockers.join(" • ")}
        </div>
      ) : null}

      <div className="mt-3 space-y-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full justify-between"
          disabled={!exportPackage.canExportMarkdown}
          aria-label={`Export Markdown ${exportPackage.markdownFilename}`}
          onClick={() =>
            downloadTextFile(exportPackage.markdownFilename, markdown.markdown, "text/markdown;charset=utf-8")
          }
        >
          Export as Markdown (.md)
          <FileDown className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full justify-between"
          disabled={!exportPackage.canExportJsonEvidence}
          aria-label={`Export JSON evidence ${exportPackage.jsonFilename}`}
          onClick={() =>
            downloadTextFile(
              exportPackage.jsonFilename,
              JSON.stringify(json, null, 2),
              "application/json;charset=utf-8",
            )
          }
        >
          Export as JSON evidence
          <FileDown className="size-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          className="w-full justify-between bg-[#2563eb] text-white hover:bg-blue-700"
          disabled={!exportPackage.canExportFullPackage}
          aria-label={`Export full package ${exportPackage.packageFilename}`}
          onClick={() =>
            downloadTextFile(
              exportPackage.packageFilename,
              JSON.stringify(
                {
                  artifactId: exportPackage.artifactId,
                  markdown: markdown.markdown,
                  jsonEvidence: json,
                },
                null,
                2,
              ),
              "application/zip",
            )
          }
        >
          Export Full Package (.zip)
          <FileArchive className="size-4" />
        </Button>
      </div>
    </section>
  );
}
