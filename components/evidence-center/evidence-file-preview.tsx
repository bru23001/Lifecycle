"use client";

import type { ReactNode } from "react";
import {
  Download,
  Menu,
  Minus,
  MoreVertical,
  Plus,
  Printer,
  RotateCw,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EvidenceCenterSelectedEvidence } from "@/types/evidence-center.types";

function PdfPreviewMockup({ title }: { title: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-white">
      <div className="flex h-14 items-center justify-between bg-slate-800 px-4 text-white min-[480px]:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-4 min-[480px]:gap-8">
          <Menu className="h-6 w-6 shrink-0" aria-hidden />

          <span className="hidden text-sm font-semibold sm:inline">1 / 18</span>

          <div className="flex items-center gap-3 min-[480px]:gap-5">
            <button type="button" className="rounded p-1 hover:bg-slate-700" aria-label="Zoom out">
              <Minus className="h-5 w-5" aria-hidden />
            </button>
            <span className="rounded bg-slate-900 px-2 py-1 text-xs font-bold min-[480px]:px-3 min-[480px]:text-sm">
              100%
            </span>
            <button type="button" className="rounded p-1 hover:bg-slate-700" aria-label="Zoom in">
              <Plus className="h-5 w-5" aria-hidden />
            </button>
            <button type="button" className="rounded p-1 hover:bg-slate-700" aria-label="Rotate preview">
              <RotateCw className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 min-[480px]:gap-5">
          <button type="button" className="rounded p-1 hover:bg-slate-700" aria-label="Download">
            <Download className="h-5 w-5" aria-hidden />
          </button>
          <button type="button" className="hidden rounded p-1 hover:bg-slate-700 sm:block" aria-label="Print">
            <Printer className="h-5 w-5" aria-hidden />
          </button>
          <button type="button" className="rounded p-1 hover:bg-slate-700" aria-label="More preview actions">
            <MoreVertical className="h-6 w-6" aria-hidden />
          </button>
        </div>
      </div>

      <div className="relative h-[320px] overflow-hidden bg-slate-100 px-4 py-6 min-[640px]:h-[430px] min-[640px]:px-10 min-[640px]:py-8">
        <div className="mx-auto h-full max-w-[1000px] overflow-y-auto bg-white px-6 py-8 shadow-sm min-[640px]:px-20 min-[640px]:py-16">
          <h2 className="text-xl font-bold text-slate-950 min-[640px]:text-3xl">{title}</h2>

          <p className="mt-4 text-lg font-semibold text-slate-800 min-[640px]:mt-5 min-[640px]:text-2xl">
            Identity Management Solutions
          </p>

          <h3 className="mt-6 text-base font-bold text-slate-950 min-[640px]:mt-10 min-[640px]:text-lg">1. Executive Summary</h3>

          <p className="mt-3 text-sm text-slate-700 min-[640px]:mt-5 min-[640px]:text-base">
            This report provides an overview of the current market landscape for identity management solutions.
          </p>

          <table className="mt-6 w-full max-w-[760px] text-left text-xs min-[640px]:mt-8 min-[640px]:text-sm">
            <thead>
              <tr className="text-slate-700">
                <th className="py-2 min-[640px]:py-3">Solution</th>
                <th className="py-2 min-[640px]:py-3">Vendor</th>
                <th className="py-2 min-[640px]:py-3">Share</th>
                <th className="py-2 min-[640px]:py-3">Strengths</th>
              </tr>
            </thead>
            <tbody className="text-slate-700">
              <tr>
                <td className="py-2 min-[640px]:py-3">Okta</td>
                <td className="py-2 min-[640px]:py-3">Okta</td>
                <td className="py-2 min-[640px]:py-3">18%</td>
                <td className="py-2 min-[640px]:py-3">Security, scale</td>
              </tr>
              <tr>
                <td className="py-2 min-[640px]:py-3">Azure AD</td>
                <td className="py-2 min-[640px]:py-3">Microsoft</td>
                <td className="py-2 min-[640px]:py-3">15%</td>
                <td className="py-2 min-[640px]:py-3">Integration</td>
              </tr>
              <tr>
                <td className="py-2 min-[640px]:py-3">Ping Identity</td>
                <td className="py-2 min-[640px]:py-3">Ping</td>
                <td className="py-2 min-[640px]:py-3">9%</td>
                <td className="py-2 min-[640px]:py-3">Customization</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="pointer-events-none absolute right-2 top-16 hidden h-[70%] w-2 rounded-full bg-slate-300 min-[640px]:right-4 min-[640px]:block">
          <div className="h-16 rounded-full bg-slate-400" />
        </div>
      </div>
    </div>
  );
}

export function EvidenceFilePreview({ selectedEvidence }: { selectedEvidence: EvidenceCenterSelectedEvidence }) {
  if (selectedEvidence.detail.evidenceType === "pdf") {
    return <PdfPreviewMockup title={selectedEvidence.detail.name} />;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
      <p>Preview is not available for this evidence type.</p>
      {selectedEvidence.detail.downloadHref ? (
        <a
          href={selectedEvidence.detail.downloadHref}
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-3 inline-flex")}
        >
          Download File
        </a>
      ) : null}
    </div>
  );
}

export function EvidencePreviewToolbarActions({
  onOpenModal,
  downloadHref,
}: {
  onOpenModal?: () => void;
  downloadHref?: string;
}): ReactNode {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {onOpenModal ? (
        <Button type="button" size="sm" variant="outline" onClick={onOpenModal}>
          Expand preview
        </Button>
      ) : null}
      {downloadHref ? (
        <a href={downloadHref} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex")}>
          Open in new tab
        </a>
      ) : null}
    </div>
  );
}
