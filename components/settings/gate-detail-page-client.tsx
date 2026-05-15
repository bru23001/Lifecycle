"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { TemplateRegistryPageShell } from "@/components/settings/template-registry-shared";
import { cn } from "@/lib/utils";
import type { GateRuleSetting, SettingsPageData } from "@/types/settings.types";

function Block({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs text-slate-800">{body.trim() || "—"}</pre>
    </section>
  );
}

export function GateDetailPageClient({ initial, rule }: { initial: SettingsPageData; rule: GateRuleSetting }) {
  const { detail } = rule;

  return (
    <TemplateRegistryPageShell
      user={initial.user}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Settings", href: "/settings/lifecycle" },
        { label: "Gate Rules", href: "/settings/gates" },
        { label: rule.gateCode },
      ]}
    >
      <div className="mt-6 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{rule.gateName}</h1>
            <p className="mt-1 text-sm text-slate-600">
              <span className="font-mono font-semibold text-slate-800">{rule.gateCode}</span>
              <span className="mx-2 text-slate-300">·</span>
              Phase {rule.relatedPhaseNumber}
              <span className="mx-2 text-slate-300">·</span>
              {rule.decisionRule}
              <span className="mx-2 text-slate-300">·</span>
              Evidence ≥ {rule.requiredEvidenceCount}
              <span className="mx-2 text-slate-300">·</span>
              {rule.status}
              {rule.unlocksPhaseNumber != null ? (
                <>
                  <span className="mx-2 text-slate-300">·</span>
                  Unlocks phase {rule.unlocksPhaseNumber}
                </>
              ) : null}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/settings/gates/${encodeURIComponent(rule.id)}/edit`}
              className={cn(buttonVariants({ variant: "default", size: "sm" }))}
            >
              Edit gate rule
            </Link>
            <Link href="/settings/gates" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
              Back to gate rules
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700">
          <span className="font-semibold text-slate-900">Required inputs: </span>
          {rule.requiredInputIds.length > 0 ? rule.requiredInputIds.join(", ") : "None"}
        </div>
        <div className="rounded-lg border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700">
          <span className="font-semibold text-slate-900">Approver roles: </span>
          {rule.requiredApproverRoles.join(", ")}
        </div>

        {detail.usageSummaryLabel.trim().length > 0 ? (
          <p className="rounded-lg border border-slate-100 bg-white px-4 py-3 text-sm">
            <span className="font-semibold text-slate-900">Usage summary: </span>
            {detail.usageSummaryLabel}
          </p>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          <Block title="Readiness rule summary" body={detail.readinessRuleSummary} />
          <Block title="Decision criteria notes" body={detail.decisionCriteriaNotes} />
          <Block title="Approver policy notes" body={detail.approverPolicyNotes} />
          <Block title="Escalation notes" body={detail.escalationNotes} />
          <Block title="Due date policy" body={detail.dueDatePolicyNotes} />
        </div>
      </div>
    </TemplateRegistryPageShell>
  );
}
