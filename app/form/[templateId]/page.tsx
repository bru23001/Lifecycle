import { notFound } from "next/navigation";

import { ArtifactSaveForm } from "@/components/artifact-save-form";
import { templateRegistry } from "@/templates/registry";

export default async function ArtifactFormPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;

  if (!(templateId in templateRegistry)) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <ArtifactSaveForm templateId={templateId} />
    </div>
  );
}
