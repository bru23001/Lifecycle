import { notFound, redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { projectAuditTrailListHref } from "@/lib/projects-url";

type PageProps = {
  params: Promise<{ id: string; auditEventId: string }>;
};

export default async function ProjectAuditEventPage({ params }: PageProps) {
  const { id, auditEventId } = await params;
  const event = await prisma.auditEntry.findFirst({
    where: { id: auditEventId, projectId: id },
    select: { id: true },
  });
  if (!event) {
    notFound();
  }
  redirect(projectAuditTrailListHref(id));
}
