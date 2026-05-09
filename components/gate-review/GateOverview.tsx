import type { GateOverviewData } from "@/types/gate-review.types";

export function GateOverview({ data }: { data: GateOverviewData }) {
  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white shadow-sm dark:border-border dark:bg-card">
      <header className="border-b border-[#e5e7eb] px-5 py-4 dark:border-border">
        <h3 className="text-base font-semibold text-[#111827] dark:text-foreground">Gate Overview</h3>
      </header>
      <div className="space-y-5 px-5 py-5">
        <div>
          <p className="text-sm font-semibold text-[#111827] dark:text-foreground">Purpose</p>
          <p className="mt-2 text-sm leading-relaxed text-[#475569] dark:text-muted-foreground">{data.purpose}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#111827] dark:text-foreground">Success Criteria</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#475569] dark:text-muted-foreground">
            {data.successCriteria.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#111827] dark:text-foreground">Gate Consequence</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800 dark:text-emerald-100">
                If Approved
              </p>
              <p className="mt-1 text-sm text-emerald-900 dark:text-emerald-50">{data.approvalConsequence}</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-900 dark:bg-amber-950/30">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-100">
                If Not Approved
              </p>
              <p className="mt-1 text-sm text-amber-950 dark:text-amber-50">{data.rejectionConsequence}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
