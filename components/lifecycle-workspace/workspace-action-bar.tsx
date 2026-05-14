"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, FileBarChart } from "lucide-react";

import { ExportPhasePackageModal } from "@/components/lifecycle-workspace/export-phase-package-modal";
import { NextRequiredActionBar } from "@/components/lifecycle-workspace/next-required-action-bar";
import type { NextRequiredAction } from "@/components/lifecycle-workspace/next-required-action-types";
import { projectReportsHubHref } from "@/lib/projects-url";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function WorkspaceActionBar({
  projectId,
  phaseNumber,
  nextRequiredAction,
  phaseExportZipBase,
}: {
  projectId: string;
  phaseNumber: number;
  nextRequiredAction: NextRequiredAction;
  phaseExportZipBase: Record<string, unknown>;
}) {
  const [exportOpen, setExportOpen] = useState(false);
  const reportsHref = projectReportsHubHref(projectId, phaseNumber);

  return (
    <>
      <div className="sticky bottom-0 z-10 mt-2 border-t bg-card">
        <div className="mx-auto flex w-full max-w-[1920px] flex-wrap items-center justify-end gap-2 border-b border-border/60 px-4 py-2">
          <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={() => setExportOpen(true)}>
            <Download className="size-3.5" aria-hidden />
            Export phase package
          </Button>
          <Link
            href={reportsHref}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "inline-flex gap-1.5 text-foreground",
            )}
          >
            <FileBarChart className="size-3.5" aria-hidden />
            Open reports
          </Link>
        </div>
        <NextRequiredActionBar
          label={nextRequiredAction.label}
          description={nextRequiredAction.description}
          ctaLabel={nextRequiredAction.ctaLabel}
          href={nextRequiredAction.href}
          secondaryHref={nextRequiredAction.secondaryHref}
          secondaryLabel={nextRequiredAction.secondaryLabel}
        />
      </div>

      <ExportPhasePackageModal
        open={exportOpen}
        exportBase={phaseExportZipBase}
        onClose={() => setExportOpen(false)}
      />
    </>
  );
}
