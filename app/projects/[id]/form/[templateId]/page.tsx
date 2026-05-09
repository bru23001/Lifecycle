import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ArtifactSaveForm } from "@/components/artifact-save-form";
import { hasTemplate } from "@/templates/registry";
import { loadTemplateDefaults } from "@/lib/loadTemplateDefaults";
import { prisma } from "@/lib/prisma";

export default async function ProjectArtifactFormPage({
  params,
}: {
  params: Promise<{ id: string; templateId: string }>;
}) {
  const { id, templateId } = await params;

  if (!hasTemplate(templateId)) {
    notFound();
  }

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    notFound();
  }

  const serverDefaults = await loadTemplateDefaults(id, templateId);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-full items-center justify-center bg-background px-4 py-16 text-sm text-muted-foreground">
          Loading form…
        </div>
      }
    >
      <ArtifactSaveForm
        templateId={templateId}
        projectId={id}
        serverDefaults={serverDefaults}
      />
    </Suspense>
  );
}
