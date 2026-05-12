"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";
import { evidenceCoverageBadgeMap } from "@/lib/evidence-status";
import type { EvidenceByGate, EvidenceByPhase, EvidenceItem } from "@/types/evidence-center.types";

export type EvidenceFilters = {
  search: string;
  type: "all" | EvidenceItem["evidenceType"];
  phase: "all" | string;
  gate: "all" | string;
  sort: "updated" | "uploaded" | "completeness" | "status" | "name";
};

export type EvidenceTab = "overview" | "linked_artifacts" | "linked_gates" | "history" | "comments";

const toneClass: Record<"green" | "amber" | "red" | "blue" | "gray", string> = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  amber: "border-amber-200 bg-amber-50 text-amber-900",
  red: "border-red-200 bg-red-50 text-red-800",
  blue: "border-blue-200 bg-blue-50 text-blue-800",
  gray: "border-slate-200 bg-slate-50 text-slate-700",
};

function byStatusRank(status: EvidenceItem["status"]) {
  if (status === "linked") return 3;
  if (status === "partially_linked") return 2;
  if (status === "unlinked") return 1;
  return 0;
}

function sortedItems(items: EvidenceItem[], sort: EvidenceFilters["sort"]) {
  const cloned = [...items];
  switch (sort) {
    case "name":
      return cloned.sort((a, b) => a.name.localeCompare(b.name));
    case "status":
      return cloned.sort((a, b) => byStatusRank(b.status) - byStatusRank(a.status));
    case "completeness":
      return cloned.sort((a, b) => b.completenessPercent - a.completenessPercent);
    case "uploaded":
      return cloned.sort((a, b) => b.uploadedOnLabel.localeCompare(a.uploadedOnLabel));
    case "updated":
      return cloned.sort((a, b) => b.uploadedOnLabel.localeCompare(a.uploadedOnLabel));
    default: {
      const neverSort: never = sort;
      throw new Error(`Unsupported sort: ${String(neverSort)}`);
    }
  }
}

export function applyEvidenceFilters(items: EvidenceItem[], filters: EvidenceFilters) {
  const filtered = items.filter((row) => {
    const haystack =
      `${row.evidenceCode} ${row.name} ${row.evidenceType} ${row.phaseName ?? ""} ${row.gateCode ?? ""} ${row.uploadedBy} ${row.status}`.toLowerCase();
    const matchesSearch = filters.search.trim().length === 0 || haystack.includes(filters.search.toLowerCase().trim());
    const matchesType = filters.type === "all" || row.evidenceType === filters.type;
    const matchesPhase = filters.phase === "all" || String(row.phaseNumber ?? "") === filters.phase;
    const matchesGate = filters.gate === "all" || row.gateCode === filters.gate;
    return matchesSearch && matchesType && matchesPhase && matchesGate;
  });
  return sortedItems(filtered, filters.sort);
}

export function EvidenceBadge({ label, tone }: { label: string; tone: keyof typeof toneClass }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", toneClass[tone])}>
      {label}
    </span>
  );
}

export function CompletionRing({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="flex items-center gap-3">
      <div
        className="grid size-20 place-items-center rounded-full border-8 border-white bg-white"
        style={{
          backgroundImage: `conic-gradient(#16a34a ${clamped}%, #e2e8f0 ${clamped}% 100%)`,
        }}
        role="progressbar"
        aria-label="Evidence completeness"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="grid size-14 place-items-center rounded-full bg-white">
          <span className="text-lg font-semibold text-slate-900">{clamped}%</span>
        </div>
      </div>
      <p className="text-sm text-slate-700">Complete</p>
    </div>
  );
}

export function CoverageBar({ percent }: { percent: number }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const tone = clamped >= 90 ? "bg-emerald-500" : clamped >= 50 ? "bg-amber-500" : clamped > 0 ? "bg-red-500" : "bg-slate-300";
  return (
    <div className="flex items-center gap-2">
      <span className="w-9 shrink-0 text-right text-xs font-medium text-slate-700">{clamped}%</span>
      <div
        className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-200"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Coverage ${clamped}%`}
      >
        <div className={cn("h-full rounded-full", tone)} style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

export function CoverageRow({
  label,
  linked,
  required,
  coveragePercent,
  status,
  href,
}: {
  label: string;
  linked: number;
  required: number;
  coveragePercent: number;
  status: EvidenceByGate["status"] | EvidenceByPhase["status"];
  href: string;
}) {
  return (
    <tr className="border-b border-slate-100 last:border-b-0">
      <td className="py-2">
        <Link href={href} className="font-medium text-slate-800 hover:text-blue-700 hover:underline">
          {label}
        </Link>
      </td>
      <td className="py-2 text-slate-700">{linked}</td>
      <td className="py-2 text-slate-700">{required}</td>
      <td className="py-2">
        <CoverageBar percent={coveragePercent} />
      </td>
      <td className="py-2">
        <EvidenceBadge {...evidenceCoverageBadgeMap[status]} />
      </td>
    </tr>
  );
}

export function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-800">{value}</dd>
    </div>
  );
}

export function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-base font-semibold text-slate-900">{value}</p>
    </div>
  );
}
