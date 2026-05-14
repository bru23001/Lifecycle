import Link from "next/link";
import { notFound } from "next/navigation";

import { ArtifactDetailView } from "@/components/artifact-detail-view";
import { prisma } from "@/lib/prisma";
import { getTemplate } from "@/templates/registry";

export default async function ArtifactDetailPage({
  params,
}: {
  params: Promise<{ id: string; artifactId: string }>;
}) {
  const { id: projectId, artifactId } = await params;

  const [artifact, project] = await Promise.all([
    prisma.artifact.findFirst({
      where: { id: artifactId, projectId },
    }),
    prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true },
    }),
  ]);

  if (!artifact || !project) {
    notFound();
  }

  let template;
  try {
    template = getTemplate(artifact.templateId);
  } catch {
    notFound();
  }

  const data = artifact.dataJson as Record<string, unknown>;
  const markdown = template.toMarkdown(data);

  const historyRows = await prisma.artifact.findMany({
    where: { projectId, templateId: artifact.templateId },
    orderBy: { createdAt: "desc" },
    take: 25,
    select: {
      id: true,
      version: true,
      localId: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <div className="min-h-full bg-background">
      <div className="border-b bg-muted/20 px-4 py-3 text-sm">
        <Link href="/" className="text-muted-foreground underline-offset-4 hover:underline">
          Home
        </Link>
      </div>
      <ArtifactDetailView
        projectId={project.id}
        projectName={project.name}
        artifact={{
          id: artifact.id,
          templateId: artifact.templateId,
          localId: artifact.localId,
          version: artifact.version,
          status: artifact.status,
          markdownPath: artifact.markdownPath,
          createdAt: artifact.createdAt.toISOString(),
          updatedAt: artifact.updatedAt.toISOString(),
        }}
        templateTitle={template.title}
        markdown={markdown}
        dataJson={data}
        history={historyRows.map((r) => ({
          id: r.id,
          version: r.version,
          localId: r.localId,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
