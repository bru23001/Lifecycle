"use client";

import { cn } from "@/lib/utils";
import { historyToneMap } from "@/lib/approval-status";
import type { ApprovalDecisionType, ApprovalHistoryEvent } from "@/types/approval-center.types";

const toneClass: Record<"green" | "amber" | "red" | "blue" | "purple" | "gray", string> = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  amber: "border-amber-200 bg-amber-50 text-amber-900",
  red: "border-red-200 bg-red-50 text-red-800",
  blue: "border-blue-200 bg-blue-50 text-blue-800",
  purple: "border-violet-200 bg-violet-50 text-violet-800",
  gray: "border-slate-200 bg-slate-50 text-slate-700",
};

export function Badge({ label, tone }: { label: string; tone: keyof typeof toneClass }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium", toneClass[tone])}>
      {label}
    </span>
  );
}

export function decisionButtonTone(decision: ApprovalDecisionType, selected: boolean) {
  if (decision === "approve") {
    return selected
      ? "border-emerald-300 bg-emerald-600 text-white"
      : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100";
  }
  if (decision === "request_changes") {
    return selected
      ? "border-amber-300 bg-amber-500 text-white"
      : "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100";
  }
  return selected
    ? "border-red-300 bg-red-600 text-white"
    : "border-red-200 bg-red-50 text-red-800 hover:bg-red-100";
}

export function TimelineEvent({ event }: { event: ApprovalHistoryEvent }) {
  return (
    <li className="relative pl-6">
      <span className="absolute left-[4px] top-3 h-[calc(100%-4px)] w-px bg-slate-200" />
      <span
        className={cn("absolute left-0 top-1.5 size-2.5 rounded-full ring-2 ring-white", dotToneClass(historyToneMap[event.statusTone]))}
      />
      <p className="text-sm font-semibold text-slate-800">{event.title}</p>
      <p className="text-xs text-slate-500">
        {event.actorName}
        {event.actorRole ? ` (${event.actorRole})` : ""} · {event.timestampLabel}
      </p>
      {event.description ? <p className="mt-1 text-sm text-slate-600">{event.description}</p> : null}
    </li>
  );
}

function dotToneClass(tone: "blue" | "green" | "amber" | "red" | "gray") {
  if (tone === "blue") return "bg-blue-500";
  if (tone === "green") return "bg-emerald-500";
  if (tone === "amber") return "bg-amber-500";
  if (tone === "red") return "bg-red-500";
  return "bg-slate-400";
}

export function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-800">{value}</dd>
    </div>
  );
}
