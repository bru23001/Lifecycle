"use client";

import { Download, Package } from "lucide-react";

import { downloadTextFile } from "@/lib/artifact-export";
import type { ArtifactExportPackage, ArtifactLibraryData } from "@/types/artifact-library.types";

import { OutlineActionButton, SidebarCard } from "./sidebar-primitives";

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
    <SidebarCard title="Export Package">
      <p className="mt-6 text-sm leading-relaxed text-slate-600 dark:text-muted-foreground sm:mt-7 sm:text-base sm:leading-7">
        Export this artifact with linked evidence and metadata.
      </p>

      {exportPackage.blockers.length > 0 ? (
        <div
          role="alert"
          className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
        >
          {exportPackage.blockers.join(" • ")}
        </div>
      ) : null}

      <div className="mt-6 space-y-4 sm:mt-7 sm:space-y-5">
        <OutlineActionButton
          disabled={!exportPackage.canExportMarkdown}
          ariaLabel={`Export Markdown ${exportPackage.markdownFilename}`}
          onClick={() =>
            downloadTextFile(exportPackage.markdownFilename, markdown.markdown, "text/markdown;charset=utf-8")
          }
          icon={<Download className="h-5 w-5 shrink-0 stroke-[2.3]" aria-hidden />}
        >
          Export as Markdown (.md)
        </OutlineActionButton>

        <OutlineActionButton
          disabled={!exportPackage.canExportJsonEvidence}
          ariaLabel={`Export JSON evidence ${exportPackage.jsonFilename}`}
          onClick={() =>
            downloadTextFile(
              exportPackage.jsonFilename,
              JSON.stringify(json, null, 2),
              "application/json;charset=utf-8",
            )
          }
          icon={<Download className="h-5 w-5 shrink-0 stroke-[2.3]" aria-hidden />}
        >
          Export as JSON Evidence (.json)
        </OutlineActionButton>

        <OutlineActionButton
          disabled={!exportPackage.canExportFullPackage}
          ariaLabel={`Export full package ${exportPackage.packageFilename}`}
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
          icon={<Package className="h-5 w-5 shrink-0 stroke-[2.3]" aria-hidden />}
        >
          Export Full Package (.zip)
        </OutlineActionButton>
      </div>
    </SidebarCard>
  );
}
