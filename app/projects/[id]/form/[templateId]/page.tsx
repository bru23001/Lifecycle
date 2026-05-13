import { redirect } from "next/navigation";

/**
 * Legacy `/projects/{id}/form/{templateId}` deep links → canonical template wizard per dashboard spec.
 */
export default async function LegacyFormToTemplateWizardRedirect({
  params,
}: {
  params: Promise<{ id: string; templateId: string }>;
}) {
  const { id, templateId } = await params;
  redirect(`/projects/${id}/templates/${encodeURIComponent(templateId)}`);
}
