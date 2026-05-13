import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Primary export CTA on report detail pages (GET JSON snapshot from API).
 */
export function ReportDetailExportActions({
  exportHref,
  exportLabel = "Download export",
  configureHref,
  configureLabel = "Configure package",
  children,
}: {
  exportHref: string;
  exportLabel?: string;
  configureHref?: string;
  configureLabel?: string;
  /** Optional extra links (e.g. open traceability matrix). */
  children?: ReactNode;
}) {
  return (
    <section
      data-testid="report-detail-export"
      className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5"
      aria-label="Report export"
    >
      <h2 className="text-sm font-semibold text-slate-900">Export</h2>
      <p className="mt-1 text-xs leading-relaxed text-slate-600">
        Download a machine-readable snapshot for governance, auditors, or downstream tooling.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <a
          href={exportHref}
          className="inline-flex h-9 items-center justify-center rounded-md bg-[#2563eb] px-3 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
          download="report-export.json"
        >
          {exportLabel}
        </a>
        {configureHref ? (
          <Link
            href={configureHref}
            className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            {configureLabel}
          </Link>
        ) : null}
        {children}
      </div>
    </section>
  );
}
