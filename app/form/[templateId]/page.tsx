import { notFound } from "next/navigation";
import { Suspense } from "react";

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
    <Suspense
      fallback={
        <div className="flex min-h-full items-center justify-center bg-background px-4 py-16 text-sm text-muted-foreground">
          Loading form…
        </div>
      }
    >
      <ArtifactSaveForm templateId={templateId} />
    </Suspense>
  );
}
