"use client";

import type { ReactNode } from "react";
import { useCallback, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
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

const PDF_PAGE_COUNT = 3;

function PdfPreviewFrame({
  title,
  interactive,
}: {
  title: string;
  interactive: boolean;
}) {
  const [page, setPage] = useState(1);
  const [zoomPct, setZoomPct] = useState(100);
  const [rotationDeg, setRotationDeg] = useState(0);

  const clampZoom = useCallback(
    (n: number) => Math.min(175, Math.max(50, n)),
    [],
  );

  const zoomOut = () => setZoomPct((z) => clampZoom(z - 15));
  const zoomIn = () => setZoomPct((z) => clampZoom(z + 15));
  const resetView = () => {
    setZoomPct(100);
    setRotationDeg(0);
    setPage(1);
  };

  const rotate = () => setRotationDeg((r) => (r + 90) % 360);

  const pageTitle =
    page === 1
      ? "1. Executive Summary"
      : page === 2
        ? "2. Market landscape"
        : "3. Recommendations";

  const pageBody =
    page === 1 ? (
      <>
        <h3 className="mt-6 text-base font-bold text-slate-950 min-[640px]:mt-10 min-[640px]:text-lg">
          {pageTitle}
        </h3>
        <p className="mt-3 text-sm text-slate-700 min-[640px]:mt-5 min-[640px]:text-base">
          This report provides an overview of the current market landscape for
          identity management solutions.
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
          </tbody>
        </table>
      </>
    ) : page === 2 ? (
      <>
        <h3 className="mt-6 text-base font-bold text-slate-950 min-[640px]:mt-10 min-[640px]:text-lg">
          {pageTitle}
        </h3>
        <p className="mt-3 text-sm text-slate-700 min-[640px]:mt-5 min-[640px]:text-base">
          Vendors continue to converge on standards-based authentication while
          differentiating on deployment models and vertical integrations.
        </p>
      </>
    ) : (
      <>
        <h3 className="mt-6 text-base font-bold text-slate-950 min-[640px]:mt-10 min-[640px]:text-lg">
          {pageTitle}
        </h3>
        <p className="mt-3 text-sm text-slate-700 min-[640px]:mt-5 min-[640px]:text-base">
          Shortlist two vendors for pilot, validate SOC 2 controls, and align
          procurement with gate evidence requirements before the next review.
        </p>
      </>
    );

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-white">
      <div className="flex h-14 items-center justify-between bg-slate-800 px-4 text-white min-[480px]:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-4 min-[480px]:gap-8">
          <Menu className="h-6 w-6 shrink-0 opacity-60" aria-hidden />

          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded p-1 hover:bg-slate-700 disabled:opacity-40"
              aria-label="Previous page"
              disabled={!interactive || page <= 1}
              onClick={() => interactive && setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <span className="hidden text-sm font-semibold sm:inline">
              {page} / {PDF_PAGE_COUNT}
            </span>
            <button
              type="button"
              className="rounded p-1 hover:bg-slate-700 disabled:opacity-40"
              aria-label="Next page"
              disabled={!interactive || page >= PDF_PAGE_COUNT}
              onClick={() =>
                interactive && setPage((p) => Math.min(PDF_PAGE_COUNT, p + 1))
              }
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <div className="flex items-center gap-3 min-[480px]:gap-5">
            <button
              type="button"
              className="rounded p-1 hover:bg-slate-700 disabled:opacity-40"
              aria-label="Zoom out"
              disabled={!interactive}
              onClick={() => interactive && zoomOut()}
            >
              <Minus className="h-5 w-5" aria-hidden />
            </button>
            <span className="rounded bg-slate-900 px-2 py-1 text-xs font-bold min-[480px]:px-3 min-[480px]:text-sm">
              {zoomPct}%
            </span>
            <button
              type="button"
              className="rounded p-1 hover:bg-slate-700 disabled:opacity-40"
              aria-label="Zoom in"
              disabled={!interactive}
              onClick={() => interactive && zoomIn()}
            >
              <Plus className="h-5 w-5" aria-hidden />
            </button>
            <button
              type="button"
              className="rounded p-1 hover:bg-slate-700 disabled:opacity-40"
              aria-label="Reset zoom and rotation"
              disabled={!interactive}
              onClick={() => interactive && resetView()}
            >
              <span className="px-1 text-[10px] font-semibold uppercase">
                Reset
              </span>
            </button>
            <button
              type="button"
              className="rounded p-1 hover:bg-slate-700 disabled:opacity-40"
              aria-label="Rotate preview"
              disabled={!interactive}
              onClick={() => interactive && rotate()}
            >
              <RotateCw className="h-5 w-5" aria-hidden />
            </button>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 min-[480px]:gap-5">
          <button
            type="button"
            className="rounded p-1 opacity-50"
            aria-label="Download"
            disabled
          >
            <Download className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            className="hidden rounded p-1 opacity-50 sm:block"
            aria-label="Print"
            disabled
          >
            <Printer className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            className="rounded p-1 opacity-50"
            aria-label="More preview actions"
            disabled
          >
            <MoreVertical className="h-6 w-6" aria-hidden />
          </button>
        </div>
      </div>

      <div className="relative h-[320px] overflow-hidden bg-slate-100 px-4 py-6 min-[640px]:h-[430px] min-[640px]:px-10 min-[640px]:py-8">
        <div className="mx-auto flex h-full max-w-[1000px] justify-center overflow-auto">
          <div
            className="origin-top bg-white px-6 py-8 shadow-sm transition-transform min-[640px]:px-20 min-[640px]:py-16"
            style={{
              transform: `scale(${zoomPct / 100}) rotate(${rotationDeg}deg)`,
            }}
          >
            <h2 className="text-xl font-bold text-slate-950 min-[640px]:text-3xl">
              {title}
            </h2>
            <p className="mt-4 text-lg font-semibold text-slate-800 min-[640px]:mt-5 min-[640px]:text-2xl">
              Identity Management Solutions
            </p>
            {pageBody}
          </div>
        </div>

        <div className="pointer-events-none absolute right-2 top-16 hidden h-[70%] w-2 rounded-full bg-slate-300 min-[640px]:right-4 min-[640px]:block">
          <div className="h-16 rounded-full bg-slate-400" />
        </div>
      </div>
    </div>
  );
}

export function EvidenceFilePreview({
  selectedEvidence,
  interactivePdf = false,
}: {
  selectedEvidence: EvidenceCenterSelectedEvidence;
  /** When true, PDF mock preview exposes working page + zoom + rotate controls (modal use). */
  interactivePdf?: boolean;
}) {
  if (selectedEvidence.detail.evidenceType === "pdf") {
    return (
      <PdfPreviewFrame
        title={selectedEvidence.detail.name}
        interactive={interactivePdf}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
      <p>Preview is not available for this evidence type.</p>
      {selectedEvidence.detail.downloadHref ? (
        <a
          href={selectedEvidence.detail.downloadHref}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "mt-3 inline-flex",
          )}
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
  previewPageHref,
}: {
  onOpenModal?: () => void;
  downloadHref?: string;
  /** Shareable full-page preview route. */
  previewPageHref?: string;
}): ReactNode {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      {onOpenModal ? (
        <Button type="button" size="sm" variant="outline" onClick={onOpenModal}>
          Expand preview
        </Button>
      ) : null}
      {previewPageHref ? (
        <Link
          href={previewPageHref}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "inline-flex",
          )}
        >
          Open preview page
        </Link>
      ) : null}
      {downloadHref ? (
        <a
          href={downloadHref}
          target="_blank"
          rel="noreferrer"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "inline-flex",
          )}
        >
          Open in new tab
        </a>
      ) : null}
    </div>
  );
}
