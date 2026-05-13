"use client";

import { useId, useState, type ReactNode } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Download } from "lucide-react";

import type {
  EvidenceByGate,
  EvidenceByPhase,
  EvidenceCenterData,
  EvidenceCenterSelectedEvidence,
} from "@/types/evidence-center.types";

import { cn } from "@/lib/utils";

type CompletenessTone = "green" | "amber" | "red";

function CountBadge({ count }: { count: number }) {
  return (
    <span className="inline-flex h-6 min-w-8 items-center justify-center rounded-full bg-slate-100 px-2 text-xs font-semibold text-slate-700">
      {count}
    </span>
  );
}

function Card({ children }: { children: ReactNode }) {
  return <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">{children}</section>;
}

function ColorDot({ color }: { color: CompletenessTone }) {
  const colorClasses = {
    green: "bg-emerald-600",
    amber: "bg-amber-500",
    red: "bg-red-500",
  };

  return <span className={cn("inline-flex h-3 w-3 rounded-full", colorClasses[color])} />;
}

function completenessDonutGradient(
  completePct: number,
  partialPct: number,
  missingPct: number,
  unlinkedPct: number,
) {
  const segments: { pct: number; color: string }[] = [
    { pct: completePct, color: "#16a34a" },
    { pct: partialPct, color: "#f59e0b" },
    { pct: missingPct + unlinkedPct, color: "#ef4444" },
  ];
  const sum = segments.reduce((a, s) => a + s.pct, 0);
  if (sum <= 0) {
    return "conic-gradient(#e2e8f0 0deg 360deg)";
  }
  let cursor = 0;
  const parts: string[] = [];
  for (const seg of segments) {
    if (seg.pct <= 0) continue;
    const span = (seg.pct / sum) * 360;
    const start = cursor;
    const end = cursor + span;
    parts.push(`${seg.color} ${start}deg ${end}deg`);
    cursor = end;
  }
  if (cursor < 360) {
    parts.push(`#e2e8f0 ${cursor}deg 360deg`);
  }
  return `conic-gradient(${parts.join(", ")})`;
}

function DonutChart({ overallPercent, completePct, partialPct, missingPct, unlinkedPct }: {
  overallPercent: number;
  completePct: number;
  partialPct: number;
  missingPct: number;
  unlinkedPct: number;
}) {
  const bg = completenessDonutGradient(completePct, partialPct, missingPct, unlinkedPct);
  const clamped = Math.max(0, Math.min(100, overallPercent));

  return (
    <div className="relative flex h-[88px] w-[88px] shrink-0 items-center justify-center rounded-full">
      <div className="absolute inset-0 rounded-full" style={{ background: bg }} />

      <div className="absolute inset-[9px] rounded-full bg-white" />

      <div className="relative text-center">
        <p className="text-xl font-semibold tracking-[0.08em] text-slate-950">{clamped}%</p>
        <p className="mt-0.5 text-xs font-medium text-slate-600">Complete</p>
      </div>
    </div>
  );
}

function LinkFooter({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="mt-3.5 flex w-full items-center justify-between text-sm font-semibold text-blue-600 hover:text-blue-700"
    >
      {label}
      <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
    </Link>
  );
}

function CoverageBar({ value }: { value: number }) {
  let barColor = "bg-red-500";
  if (value >= 80) barColor = "bg-emerald-600";
  else if (value >= 40) barColor = "bg-amber-500";

  return (
    <div className="flex items-center gap-1.5">
      <span className="w-8 text-right text-xs font-semibold text-slate-700">{value}%</span>
      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-200">
        <div
          className={cn("h-full rounded-full", value === 0 ? "bg-slate-200" : barColor)}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}

function CoverageTable({
  title,
  count,
  firstColumnLabel,
  rows,
  footerHref,
  footerLabel,
  linkedHeader,
  collapsible = false,
  defaultExpanded = true,
}: {
  title: string;
  count: number;
  firstColumnLabel: string;
  rows: {
    id: string;
    label: string;
    linked: number;
    required: number;
    coverage: number;
    href?: string;
  }[];
  footerHref: string;
  footerLabel: string;
  linkedHeader: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const panelId = useId();
  const headingId = `${panelId}-heading`;

  const body = (
    <>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-600">No rows to display.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-600">
                <th className="pb-2 pr-3">{firstColumnLabel}</th>
                <th className="pb-2 pr-3 text-center">{linkedHeader}</th>
                <th className="pb-2 pr-3 text-center">Required</th>
                <th className="pb-2 text-right">Coverage</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 text-sm last:border-b-0">
                  <td className="py-2 pr-3 font-semibold text-slate-900">
                    {row.href ? (
                      <Link href={row.href} className="text-slate-900 hover:text-blue-600 hover:underline">
                        {row.label}
                      </Link>
                    ) : (
                      row.label
                    )}
                  </td>
                  <td className="py-2 pr-3 text-center font-medium text-slate-700">{row.linked}</td>
                  <td className="py-2 pr-3 text-center font-medium text-slate-700">{row.required}</td>
                  <td className="py-2">
                    <div className="flex justify-end">
                      <CoverageBar value={row.coverage} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <LinkFooter href={footerHref} label={footerLabel} />
    </>
  );

  return (
    <Card>
      {collapsible ? (
        <>
          <header className="mb-0 flex items-center gap-2">
            <button
              type="button"
              id={headingId}
              className="flex min-w-0 flex-1 items-center gap-2 rounded-lg py-1 text-left outline-none ring-offset-2 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={() => setExpanded((e) => !e)}
            >
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200",
                  expanded ? "rotate-0" : "-rotate-90",
                )}
                aria-hidden
              />
              <h2 className="min-w-0 flex-1 text-lg font-semibold text-slate-950">{title}</h2>
            </button>
            <CountBadge count={count} />
          </header>

          <div id={panelId} role="region" aria-labelledby={headingId} hidden={!expanded}>
            <div className="mt-3">{body}</div>
          </div>
        </>
      ) : (
        <>
          <header className="mb-3 flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
            <CountBadge count={count} />
          </header>
          {body}
        </>
      )}
    </Card>
  );
}

function ExportAction({
  label,
  icon,
  disabled,
  onClick,
  ariaLabel,
}: {
  label: string;
  icon: ReactNode;
  disabled?: boolean;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={onClick}
      className={cn(
        "flex h-12 flex-col items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold shadow-sm",
        disabled ? "cursor-not-allowed text-slate-400 opacity-60" : "text-blue-600 hover:bg-slate-50",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

export function EvidenceCompletenessCard({ selectedEvidence }: { selectedEvidence: EvidenceCenterSelectedEvidence }) {
  const c = selectedEvidence.completeness;
  const unlinkedPct = c.unlinked?.percent ?? 0;
  const items: { id: string; label: string; percent: number; count: number; color: CompletenessTone }[] = [
    { id: "complete", label: "Complete", percent: c.complete.percent, count: c.complete.count, color: "green" },
    { id: "partial", label: "Partial", percent: c.partial.percent, count: c.partial.count, color: "amber" },
    {
      id: "missing",
      label: "Missing",
      percent: c.missing.percent + unlinkedPct,
      count: c.missing.count + (c.unlinked?.count ?? 0),
      color: "red",
    },
  ];

  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-950">Evidence Completeness</h2>

      <div className="mt-4 grid grid-cols-1 items-center gap-4 md:grid-cols-[110px_1fr]">
        <DonutChart
          overallPercent={c.overallPercent}
          completePct={c.complete.percent}
          partialPct={c.partial.percent}
          missingPct={c.missing.percent}
          unlinkedPct={unlinkedPct}
        />

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-[16px_1fr_auto] items-center gap-2.5">
              <ColorDot color={item.color} />
              <p className="text-sm font-medium text-slate-700">{item.label}</p>
              <p className="text-sm font-semibold text-slate-900">
                {item.percent}% ({item.count})
              </p>
            </div>
          ))}
        </div>
      </div>

      <LinkFooter href={c.detailsHref} label="View Completeness Details" />
    </Card>
  );
}

export function EvidenceByGateCard({ projectId, rows }: { projectId: string; rows: EvidenceByGate[] }) {
  const mapped = rows.map((row) => ({
    id: row.gateId,
    label: `${row.gateCode} – ${row.gateName}`,
    linked: row.evidenceLinked,
    required: row.requiredEvidence,
    coverage: row.coveragePercent,
    href: row.href,
  }));

  return (
    <CoverageTable
      title="Evidence by Gate"
      count={rows.length}
      firstColumnLabel="Gate"
      rows={mapped}
      footerHref={`/projects/${projectId}/traceability/gate-evidence`}
      footerLabel="View Gate Evidence Matrix"
      linkedHeader="Evidence Linked"
      collapsible
    />
  );
}

export function EvidenceByPhaseCard({ projectId, rows }: { projectId: string; rows: EvidenceByPhase[] }) {
  const mapped = rows.map((row) => ({
    id: row.phaseId,
    label: `${row.phaseNumber}. ${row.phaseName}`,
    linked: row.evidenceItems,
    required: row.requiredEvidence,
    coverage: row.coveragePercent,
    href: row.href,
  }));

  return (
    <CoverageTable
      title="Evidence by Phase"
      count={rows.length}
      firstColumnLabel="Phase"
      rows={mapped}
      footerHref={`/projects/${projectId}/traceability/phase-evidence`}
      footerLabel="View Phase Evidence Matrix"
      linkedHeader="Evidence Linked"
      collapsible
    />
  );
}

export function EvidenceExportBundleCard({
  exportBundle,
  selectedForExport,
  onExport,
}: {
  exportBundle: EvidenceCenterData["exportBundle"];
  selectedForExport: string[];
  onExport: (scope: "selected" | "gate" | "full", evidenceIds: string[]) => Promise<void>;
}) {
  const n = selectedForExport.length;

  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-950">Evidence Export Bundle</h2>

      <p className="mt-3 text-sm leading-snug text-slate-600">
        Export selected evidence with metadata and traceability information.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Link
          href={`/projects/${exportBundle.projectId}/reports/evidence-package`}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-blue-600 shadow-sm hover:bg-slate-50"
        >
          Open evidence package report
        </Link>
        <Link
          href={`/projects/${exportBundle.projectId}/reports/evidence-package/configure`}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-blue-600 shadow-sm hover:bg-slate-50"
        >
          Configure export package
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <ExportAction
          label="Export Selected"
          ariaLabel="Export selected evidence bundle"
          disabled={!exportBundle.canExportSelected || n === 0}
          onClick={() => void onExport("selected", selectedForExport)}
          icon={
            <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-blue-50 px-2 text-xs font-semibold text-blue-600">
              {n}
            </span>
          }
        />
        <ExportAction
          label="Export by Gate"
          ariaLabel="Export evidence by gate"
          disabled={!exportBundle.canExportByGate}
          onClick={() => void onExport("gate", selectedForExport)}
          icon={<Download className="h-4 w-4 stroke-[2.2]" aria-hidden />}
        />
        <ExportAction
          label="Export Full Bundle"
          ariaLabel="Export full evidence bundle"
          disabled={!exportBundle.canExportFullBundle}
          onClick={() => void onExport("full", selectedForExport)}
          icon={<Download className="h-4 w-4 stroke-[2.2]" aria-hidden />}
        />
      </div>
    </Card>
  );
}

export function EvidenceCoveragePanel({
  data,
  selectedEvidence,
  selectedForExport,
  onExport,
}: {
  data: EvidenceCenterData;
  selectedEvidence: EvidenceCenterSelectedEvidence;
  selectedForExport: string[];
  onExport: (scope: "selected" | "gate" | "full", evidenceIds: string[]) => Promise<void>;
}) {
  return (
    <section className="flex w-full min-w-0 max-w-[720px] flex-col space-y-3">
      <EvidenceCompletenessCard selectedEvidence={selectedEvidence} />
      <EvidenceByGateCard projectId={data.project.id} rows={data.evidenceByGate} />
      <EvidenceByPhaseCard projectId={data.project.id} rows={data.evidenceByPhase} />
      <EvidenceExportBundleCard exportBundle={data.exportBundle} selectedForExport={selectedForExport} onExport={onExport} />
    </section>
  );
}
