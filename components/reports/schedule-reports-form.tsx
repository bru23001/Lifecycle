"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function ScheduleReportsForm({ projectId }: { projectId: string }) {
  const [frequency, setFrequency] = useState<"weekly" | "monthly" | "quarterly">("weekly");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);

  return (
    <div className="space-y-6">
      <fieldset className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <legend className="text-lg font-semibold text-slate-900">Delivery</legend>
        <label className="mt-4 flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Frequency</span>
          <select
            className="h-10 rounded-lg border border-slate-200 bg-white px-3"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as typeof frequency)}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </label>
        <label className="mt-4 flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Notify email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="team@example.com"
            className="h-10 rounded-lg border border-slate-200 px-3"
          />
        </label>
      </fieldset>
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          onClick={() => {
            setSaved(true);
            window.setTimeout(() => setSaved(false), 2400);
          }}
        >
          {saved ? "Saved (demo)" : "Save schedule"}
        </Button>
        <Link
          href={`/projects/${projectId}/reports`}
          className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted"
        >
          Back to reports
        </Link>
      </div>
      <p className="text-xs text-slate-500">Scheduling integrates with your notification service when configured.</p>
    </div>
  );
}
