"use client";

import Link from "next/link";

import { MetaRow } from "@/components/settings/shared";
import type { SystemOverview } from "@/types/settings.types";

export function SystemOverviewPanel({
  data,
}: {
  data: SystemOverview;
}) {
  return (
    <article className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">System Overview</h3>
      <dl className="mt-3 space-y-2 text-sm">
        <MetaRow label="Lifecycle Model" value={data.lifecycleModelName} />
        <MetaRow label="Gate Model" value={`${data.gateCount} gates`} />
        <MetaRow label="Template Sets" value={`${data.activeTemplateCount} active`} />
        <MetaRow label="User Roles" value={`${data.roleCount} roles`} />
        <MetaRow label="Permissions" value={`${data.permissionRuleCount} rules`} />
        <MetaRow label="Export Formats" value={data.exportFormats.join(", ")} />
        <MetaRow label="Local Storage" value={data.localStorageUsageLabel} />
      </dl>
      <Link href={data.overviewHref} className="mt-3 inline-flex items-center text-sm font-semibold text-blue-700 hover:underline">
        View All Settings Overview
      </Link>
    </article>
  );
}
