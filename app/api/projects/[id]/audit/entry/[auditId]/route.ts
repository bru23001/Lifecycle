import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/server/current-user";

export const dynamic = "force-dynamic";

function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return "***";
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const head = local.slice(0, 1);
  return `${head}***@${domain}`;
}

function actorDisplay(name: string | null | undefined, email: string | null | undefined): string {
  const n = name?.trim();
  if (n) return n;
  if (email?.trim()) return maskEmail(email.trim());
  return "System";
}

export async function GET(_req: Request, context: { params: Promise<{ id: string; auditId: string }> }) {
  try {
    await requireCurrentUser();
  } catch {
    return NextResponse.json({ error: "Current user is unavailable." }, { status: 401 });
  }

  const { id: projectId, auditId } = await context.params;

  const row = await prisma.auditEntry.findFirst({
    where: { id: auditId, projectId },
    include: { actor: { select: { name: true, email: true } } },
  });

  if (!row) {
    return NextResponse.json({ error: "Audit entry not found." }, { status: 404 });
  }

  const metadata =
    row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata) ?
      (row.metadata as Record<string, unknown>)
    : {};

  return NextResponse.json(
    {
      entry: {
        id: row.id,
        action: row.action,
        subjectKind: row.subjectKind,
        subjectId: row.subjectId,
        metadata,
        createdAtIso: row.createdAt.toISOString(),
        actorLabel: actorDisplay(row.actor?.name, row.actor?.email),
      },
    },
    { status: 200 },
  );
}
