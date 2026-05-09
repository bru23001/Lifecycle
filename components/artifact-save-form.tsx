"use client";

import { PhaseWizardForm } from "@/components/phase-wizard-form";

export function ArtifactSaveForm({
  templateId,
  projectId,
  serverDefaults,
}: {
  templateId: string;
  projectId?: string;
  serverDefaults?: Record<string, unknown>;
}) {
  return (
    <div className="min-h-full bg-background">
      <PhaseWizardForm
        templateId={templateId}
        projectId={projectId}
        serverDefaults={serverDefaults}
      />
    </div>
  );
}
