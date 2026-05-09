import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TracePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) notFound();

  const links = await prisma.traceLink.findMany({
    where: { projectId: id },
    orderBy: { createdAt: "desc" },
  });

  const reqs = await prisma.requirement.findMany({
    where: { projectId: id },
    select: { id: true, localId: true },
  });
  const feats = await prisma.feature.findMany({
    where: { projectId: id },
    select: { id: true, localId: true },
  });
  const reqLabel = new Map(reqs.map((r) => [r.id, r.localId]));
  const featLabel = new Map(feats.map((f) => [f.id, f.localId]));

  function label(kind: string, entityId: string): string {
    if (kind === "feature") return featLabel.get(entityId) ?? entityId.slice(0, 8);
    if (kind === "requirement") return reqLabel.get(entityId) ?? entityId.slice(0, 8);
    return entityId.slice(0, 8);
  }

  const orphansReq = reqs.filter((r) => {
    const incoming = links.some((l) => l.toKind === "requirement" && l.toId === r.id);
    const outgoing = links.some((l) => l.fromKind === "requirement" && l.fromId === r.id);
    return !incoming && !outgoing;
  });

  const orphansFeat = feats.filter((f) => {
    const incoming = links.some((l) => l.toKind === "feature" && l.toId === f.id);
    const outgoing = links.some((l) => l.fromKind === "feature" && l.fromId === f.id);
    return !incoming && !outgoing;
  });

  return (
    <div className="min-h-full bg-background px-4 py-10 text-foreground">
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <p className="text-sm text-muted-foreground">
            <Link href="/projects" className="underline-offset-4 hover:underline">
              Projects
            </Link>
            {" · "}
            <Link
              href={`/projects/${id}`}
              className="underline-offset-4 hover:underline"
            >
              {project.name}
            </Link>
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Trace links</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Derived from relational Requirement / Feature rows and saved artifacts (A-1…A-9).
          </p>
        </header>

        <section className="rounded-2xl border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Links</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {links.length === 0 ? (
              <li className="text-muted-foreground">No trace links yet.</li>
            ) : (
              links.map((l) => (
                <li key={l.id} className="font-mono text-xs">
                  {label(l.fromKind, l.fromId)} —[{l.relation}]→{" "}
                  {label(l.toKind, l.toId)}
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="rounded-2xl border bg-amber-500/10 p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Orphan requirements</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Rows with no incoming or outgoing trace link (informational).
          </p>
          <ul className="mt-3 list-inside list-disc text-sm">
            {orphansReq.length === 0 ? (
              <li className="text-muted-foreground">None</li>
            ) : (
              orphansReq.map((r) => <li key={r.id}>{r.localId}</li>)
            )}
          </ul>
        </section>

        <section className="rounded-2xl border bg-amber-500/10 p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Orphan features</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Features with no trace link to or from another entity (informational).
          </p>
          <ul className="mt-3 list-inside list-disc text-sm">
            {orphansFeat.length === 0 ? (
              <li className="text-muted-foreground">None</li>
            ) : (
              orphansFeat.map((f) => <li key={f.id}>{f.localId}</li>)
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
