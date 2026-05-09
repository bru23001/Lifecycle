import { notFound } from "next/navigation";

import { TemplateWizardScreen } from "@/components/template-wizard/template-wizard-screen";
import { buildTemplateWizardSeed } from "@/data/template-wizard.mock";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function TemplateWizardPage({
  params,
}: {
  params: Promise<{ id: string; templateId: string }>;
}) {
  const { id, templateId } = await params;

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) {
    notFound();
  }

  const initial = buildTemplateWizardSeed({
    projectId: project.id,
    projectName: project.name,
    projectCode: project.vaultFolder,
    templateSlug: templateId,
  });

  return <TemplateWizardScreen initial={initial} />;
}
