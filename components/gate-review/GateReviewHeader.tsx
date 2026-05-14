"use client";

import Link from "next/link";
import { CheckCircle2, Clock3, Shield } from "lucide-react";

import type {
  GateApprover,
  GateReviewHeaderChecklist,
  GateReviewHeaderData,
} from "@/types/gate-review.types";

import { GateStatusPopoverTrigger } from "./gate-status-popover";
import { projectGateAuditTrailHref } from "@/lib/projects-url";

type ReadinessStatus = "complete" | "waiting";

function GateShieldBadge({ gateCode }: { gateCode: string }) {
  return (
    <div
      className="flex h-[84px] w-[84px] shrink-0 items-center justify-center rounded-3xl bg-amber-400 text-white dark:bg-amber-500"
      aria-hidden
    >
      <div className="relative flex h-[60px] w-[60px] items-center justify-center">
        <Shield className="absolute h-[60px] w-[60px] fill-none stroke-white stroke-[2]" />
        <span className="mt-0.5 text-base font-bold">{gateCode}</span>
      </div>
    </div>
  );
}

function ReadinessRing({ percent }: { percent: number }) {
  const p = Math.min(100, Math.max(0, percent));
  const angle = (p / 100) * 360;
  return (
    <div
      className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full [--readiness-track:#e5e7eb] dark:[--readiness-track:#334155]"
      role="progressbar"
      aria-label={`Gate readiness ${p} percent complete`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={p}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(#1d4ed8 0deg ${angle}deg, var(--readiness-track) ${angle}deg 360deg)`,
        }}
      />
      <div className="absolute inset-[6px] rounded-full bg-white dark:bg-card" />
      <div className="relative text-center">
        <p className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-foreground">{p}%</p>
        <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-muted-foreground">Complete</p>
      </div>
    </div>
  );
}

function ReadinessIcon({ status }: { status: ReadinessStatus }) {
  if (status === "complete") {
    return <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 dark:text-emerald-400" aria-hidden />;
  }
  return <Clock3 className="h-5 w-5 shrink-0 text-amber-500 dark:text-amber-400" aria-hidden />;
}

function formatReviewType(t: GateReviewHeaderData["reviewType"]) {
  switch (t) {
    case "standard":
      return "Standard";
    case "expedited":
      return "Expedited";
    case "exception":
      return "Exception";
    default:
      return t;
  }
}

function formatApproversSummary(approvers: GateApprover[]) {
  const total = approvers.length;
  const completed = approvers.filter((a) =>
    ["reviewed", "approved", "rejected"].includes(a.status),
  ).length;
  return `${completed} of ${total} reviewed`;
}

export function GateReviewHeader({
  data,
  checklist,
  approvers,
  onSendReminder,
  canSendReminders = false,
  onPreviewAuditTrail,
}: {
  data: GateReviewHeaderData;
  checklist: GateReviewHeaderChecklist;
  approvers: GateApprover[];
  onSendReminder?: () => void;
  canSendReminders?: boolean;
  onPreviewAuditTrail?: () => void;
}) {
  const projectCode = data.projectCode?.trim();
  const readinessItems: { id: string; label: string; status: ReadinessStatus }[] = [
    {
      id: "inputs",
      label: "All required inputs provided",
      status: checklist.allRequiredInputsProvided ? "complete" : "waiting",
    },
    {
      id: "evidence",
      label: "Evidence attached",
      status: checklist.evidenceAttached ? "complete" : "waiting",
    },
    {
      id: "criteria",
      label: "Decision criteria met",
      status: checklist.decisionCriteriaMet ? "complete" : "waiting",
    },
    {
      id: "reviewer",
      label: "Awaiting reviewer decision",
      status: checklist.awaitingReviewerDecision ? "waiting" : "complete",
    },
  ];

  return (
    <section
      aria-label="Gate review summary"
      className="grid w-full grid-cols-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card xl:grid-cols-[1.05fr_1.25fr_0.75fr]"
    >
      <article className="flex items-center gap-6 border-b border-slate-100 p-6 dark:border-border xl:border-b-0 xl:border-r">
        <GateShieldBadge gateCode={data.gateCode} />

        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-3">
            <p className="text-sm font-semibold text-slate-500 dark:text-muted-foreground">
              Gate {data.gateNumber} of {data.totalGates}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-foreground">{data.gateName}</h2>

            <GateStatusPopoverTrigger status={data.status} checklist={checklist} />
            <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
              <Link
                data-testid="gate-review-header-audit-trail-link"
                href={projectGateAuditTrailHref(data.projectId, data.gateCode)}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
              >
                View audit trail
              </Link>
              {onPreviewAuditTrail ? (
                <>
                  <span className="text-sm text-slate-400 dark:text-muted-foreground" aria-hidden>
                    ·
                  </span>
                  <button
                    type="button"
                    data-testid="gate-review-header-audit-trail-preview"
                    onClick={onPreviewAuditTrail}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Preview
                  </button>
                </>
              ) : null}
            </span>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600 dark:text-muted-foreground">{data.purpose}</p>
        </div>
      </article>

      <article className="grid grid-cols-1 gap-x-12 gap-y-6 border-b border-slate-100 p-6 md:grid-cols-3 dark:border-border xl:border-b-0 xl:border-r">
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-muted-foreground">Project</p>
          <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-foreground">
            {data.projectName}{" "}
            {projectCode ? (
              <span className="text-slate-500 dark:text-muted-foreground">({projectCode})</span>
            ) : null}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-muted-foreground">Phase</p>
          <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-foreground">
            {data.phaseNumber}. {data.phaseName}
          </p>
        </div>

        <div className="hidden md:block" aria-hidden />

        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-muted-foreground">Gate Owner</p>
          <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-foreground">{data.gateOwnerName}</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-muted-foreground">Submitted On</p>
          <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-foreground">{data.submittedOnLabel}</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-muted-foreground">Submitted By</p>
          <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-foreground">{data.submittedByName}</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-muted-foreground">Review Type</p>
          <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-foreground">
            {formatReviewType(data.reviewType)}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-muted-foreground">Due Date</p>
          <p className="mt-2 text-sm font-semibold text-red-600 dark:text-red-400">
            {data.dueDateLabel}{" "}
            {data.dueRelativeLabel ? (
              <span className="text-amber-600 dark:text-amber-400">{data.dueRelativeLabel}</span>
            ) : null}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-muted-foreground">Approvers</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold text-slate-950 dark:text-foreground">
              {formatApproversSummary(approvers)}
            </p>
            {onSendReminder && canSendReminders ? (
              <button
                type="button"
                onClick={onSendReminder}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Send reminder
              </button>
            ) : null}
          </div>
        </div>
      </article>

      <article className="p-6">
        <h3 className="mb-5 text-lg font-semibold text-slate-950 dark:text-foreground">Gate Readiness</h3>

        <div className="flex flex-col items-start gap-7 sm:flex-row sm:items-center">
          <ReadinessRing percent={data.readinessPercent} />

          <div className="min-w-0 space-y-3">
            {readinessItems.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <ReadinessIcon status={item.status} />
                <p className="text-sm font-medium text-slate-700 dark:text-foreground/90">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}
