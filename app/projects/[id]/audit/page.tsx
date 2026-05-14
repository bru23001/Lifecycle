import { notFound } from "next/navigation";

import { GateAuditTrailView } from "@/components/gate-audit/gate-audit-trail-view";
import { loadGateAuditTrailView } from "@/lib/server/gate-audit-trail";
import { getCurrentUserDisplay } from "@/lib/server/current-user";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(v: string | string[] | undefined): string | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v[0] : v;
}

export default async function ProjectGateAuditTrailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const gate = firstParam(sp.gate);
  const data = await loadGateAuditTrailView(id, gate);
  if (!data) {
    notFound();
  }
  const user = await getCurrentUserDisplay();
  const openEvent = firstParam(sp.openAuditEvent);
  return <GateAuditTrailView data={data} user={user} initialOpenEventId={openEvent} />;
}
