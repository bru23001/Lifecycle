"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";
import { evidenceCoverageBadgeMap } from "@/lib/evidence-status";
import type { EvidenceByGate, EvidenceByPhase, EvidenceDetail, EvidenceItem } from "@/types/evidence-center.types";

export type EvidenceFilters = {
  search: string;
  type: "all" | EvidenceItem["evidenceType"];
  phase: "all" | string;
  gate: "all" | string;
  sort:
    | "updated"
    | "uploaded"
    | "completeness"
    | "status"
    | "name"
    | "evidenceType"
    | "classification"
    | "gate"
    | "phase";
  status: "all" | EvidenceItem["status"];
  artifactId: "all" | string;
  classification: "all" | EvidenceDetail["classification"];
  /** Case-insensitive substring match on `uploadedBy`. */
  uploadedByContains: string;
  /** Inclusive date lower bound (`yyyy-mm-dd`) against `uploadedAtIso`. */
  uploadedFrom: string;
  /** Inclusive date upper bound (`yyyy-mm-dd`) against `uploadedAtIso`. */
  uploadedTo: string;
  /** Minimum completeness percent (0–100), empty string = no minimum. */
  completenessMin: string;
  /** Maximum completeness percent (0–100), empty string = no maximum. */
  completenessMax: string;
  /** Linked-state coarse filter (used with `status` when `status` is `all`). */
  linking: "all" | "linked_or_partial" | "unlinked_only";
};

export function defaultEvidenceFilters(): EvidenceFilters {
  return {
    search: "",
    type: "all",
    phase: "all",
    gate: "all",
    sort: "updated",
    status: "all",
    artifactId: "all",
    classification: "all",
    uploadedByContains: "",
    uploadedFrom: "",
    uploadedTo: "",
    completenessMin: "",
    completenessMax: "",
    linking: "all",
  };
}

export type EvidenceTab =
  | "overview"
  | "linked_artifacts"
  | "linked_gates"
  | "linked_phases"
  | "history"
  | "comments";

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

const classificationRank: Record<EvidenceDetail["classification"], number> = {
  public: 0,
  internal: 1,
  confidential: 2,
  restricted: 3,
};

function gateSortKey(gate?: string): number {
  if (!gate) return -1;
  const m = /^G(\d+)/i.exec(gate.trim());
  return m ? Number.parseInt(m[1], 10) : 0;
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
      return cloned.sort((a, b) => b.uploadedAtIso.localeCompare(a.uploadedAtIso));
    case "updated":
      return cloned.sort((a, b) => b.updatedAtIso.localeCompare(a.updatedAtIso));
    case "evidenceType":
      return cloned.sort((a, b) => a.evidenceType.localeCompare(b.evidenceType));
    case "classification":
      return cloned.sort(
        (a, b) => classificationRank[a.classification] - classificationRank[b.classification],
      );
    case "gate":
      return cloned.sort((a, b) => gateSortKey(a.gateCode) - gateSortKey(b.gateCode));
    case "phase":
      return cloned.sort((a, b) => (a.phaseNumber ?? 0) - (b.phaseNumber ?? 0));
    default: {
      const neverSort: never = sort;
      throw new Error(`Unsupported sort: ${String(neverSort)}`);
    }
  }
}

function dateOnlyFromIso(iso: string): string {
  return iso.slice(0, 10);
}

function parsePct(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  const n = Number.parseInt(t, 10);
  if (!Number.isFinite(n) || n < 0 || n > 100) return null;
  return n;
}

export function applyEvidenceFilters(items: EvidenceItem[], filters: EvidenceFilters) {
  const minC = parsePct(filters.completenessMin);
  const maxC = parsePct(filters.completenessMax);
  const byContains = filters.uploadedByContains.trim().toLowerCase();

  const filtered = items.filter((row) => {
    const haystack =
      `${row.evidenceCode} ${row.name} ${row.evidenceType} ${row.phaseName ?? ""} ${row.gateCode ?? ""} ${row.uploadedBy} ${row.status} ${row.classification}`.toLowerCase();
    const matchesSearch = filters.search.trim().length === 0 || haystack.includes(filters.search.toLowerCase().trim());
    const matchesType = filters.type === "all" || row.evidenceType === filters.type;
    const matchesPhase = filters.phase === "all" || String(row.phaseNumber ?? "") === filters.phase;
    const matchesGate = filters.gate === "all" || row.gateCode === filters.gate;
    const matchesStatus = filters.status === "all" || row.status === filters.status;
    const matchesArtifact =
      filters.artifactId === "all" || row.linkedArtifactIds.includes(filters.artifactId);
    const matchesClassification =
      filters.classification === "all" || row.classification === filters.classification;
    const matchesUploader =
      byContains.length === 0 || row.uploadedBy.toLowerCase().includes(byContains);

    const day = dateOnlyFromIso(row.uploadedAtIso);
    const matchesFrom = !filters.uploadedFrom || day >= filters.uploadedFrom;
    const matchesTo = !filters.uploadedTo || day <= filters.uploadedTo;

    const matchesCompletenessMin = minC === null || row.completenessPercent >= minC;
    const matchesCompletenessMax = maxC === null || row.completenessPercent <= maxC;

    let matchesLinking = true;
    if (filters.linking === "linked_or_partial") {
      matchesLinking = row.status === "linked" || row.status === "partially_linked";
    } else if (filters.linking === "unlinked_only") {
      matchesLinking = row.status === "unlinked";
    }

    return (
      matchesSearch &&
      matchesType &&
      matchesPhase &&
      matchesGate &&
      matchesStatus &&
      matchesArtifact &&
      matchesClassification &&
      matchesUploader &&
      matchesFrom &&
      matchesTo &&
      matchesCompletenessMin &&
      matchesCompletenessMax &&
      matchesLinking
    );
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
