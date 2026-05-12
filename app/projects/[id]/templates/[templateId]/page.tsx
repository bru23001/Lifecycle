import { TemplateWizardScreen } from "@/components/template-wizard/template-wizard-screen";
import { loadTemplateWizardData } from "@/lib/server/template-wizard";

export const dynamic = "force-dynamic";

export default async function TemplateWizardPage({
  params,
}: {
  params: Promise<{ id: string; templateId: string }>;
}) {
  const { id, templateId } = await params;

  const initial = await loadTemplateWizardData(id, templateId);

  return <TemplateWizardScreen initial={initial} />;
}
