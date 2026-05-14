import JSZip from "jszip";

import type { JsonEvidence, ValidationSummary } from "@/types/template-wizard.types";

export type ArtifactPackageOptions = {
  includeMarkdown: boolean;
  includeJsonEvidence: boolean;
  includeEvidenceManifest: boolean;
  includeLinkedEvidenceFiles: boolean;
  includeValidationReport: boolean;
  includeVersionMetadata: boolean;
};

export type BuildArtifactPackageArgs = {
  packageBasename: string;
  markdown: string;
  jsonEvidence: JsonEvidence;
  validationSummary: ValidationSummary;
  manifestExtras: {
    templateCode: string;
    templateName: string;
    phaseNumber: number;
    phaseName: string;
    artifactVersion: string;
    templateVersion: string;
    generatedAt: string;
    projectId: string;
  };
  options: ArtifactPackageOptions;
};

function validationReportMarkdown(summary: ValidationSummary): string {
  const lines = [
    "# Validation report",
    "",
    `- **Completion:** ${summary.completionPercent}%`,
    `- **Export ready:** ${summary.exportReady ? "yes" : "no"}`,
    `- **Required fields:** ${summary.requiredFieldsComplete}/${summary.requiredFieldsTotal}`,
    `- **Sections:** ${summary.sectionsComplete}/${summary.sectionsTotal}`,
    `- **Evidence links:** ${summary.evidenceLinksComplete}/${summary.evidenceLinksRequired}`,
    `- **Errors:** ${summary.errorCount} · **Warnings:** ${summary.warningCount}`,
    "",
    "## Issues",
    "",
  ];
  if (summary.issues.length === 0) {
    lines.push("_No issues._");
  } else {
    for (const i of summary.issues) {
      lines.push(`- **${i.severity}**${i.sectionId ? ` (${i.sectionId})` : ""}: ${i.message}`);
    }
  }
  lines.push("");
  return lines.join("\n");
}

export async function buildTemplateWizardArtifactZip(
  args: BuildArtifactPackageArgs,
): Promise<Blob> {
  const zip = new JSZip();
  const root = args.packageBasename.replace(/\.zip$/i, "").replace(/[^a-z0-9-_]+/gi, "-") || "artifact-package";
  const folder = zip.folder(root);
  if (!folder) throw new Error("Unable to create zip folder.");

  const { options } = args;

  if (options.includeMarkdown) {
    folder.file("artifact.md", args.markdown);
  }
  if (options.includeJsonEvidence) {
    folder.file("evidence.json", JSON.stringify(args.jsonEvidence as unknown as Record<string, unknown>, null, 2));
  }
  if (options.includeEvidenceManifest) {
    folder.file(
      "manifest.json",
      JSON.stringify(
        {
          kind: "cybercube.template-wizard.artifact-package",
          version: 1,
          generatedAt: args.manifestExtras.generatedAt,
          contents: [
            options.includeMarkdown && "artifact.md",
            options.includeJsonEvidence && "evidence.json",
            options.includeEvidenceManifest && "manifest.json",
            options.includeLinkedEvidenceFiles && "linked-evidence/links.json",
            options.includeValidationReport && "validation-report.md",
            options.includeVersionMetadata && "version-metadata.json",
          ].filter(Boolean),
          templateCode: args.manifestExtras.templateCode,
          projectId: args.manifestExtras.projectId,
        },
        null,
        2,
      ),
    );
  }
  if (options.includeLinkedEvidenceFiles) {
    const links = args.jsonEvidence.evidenceLinks ?? [];
    folder.file("linked-evidence/links.json", JSON.stringify({ evidenceLinks: links }, null, 2));
  }
  if (options.includeValidationReport) {
    folder.file("validation-report.md", validationReportMarkdown(args.validationSummary));
  }
  if (options.includeVersionMetadata) {
    folder.file(
      "version-metadata.json",
      JSON.stringify(
        {
          templateVersion: args.manifestExtras.templateVersion,
          artifactVersion: args.manifestExtras.artifactVersion,
          templateCode: args.manifestExtras.templateCode,
          templateName: args.manifestExtras.templateName,
          phaseNumber: args.manifestExtras.phaseNumber,
          phaseName: args.manifestExtras.phaseName,
          generatedAt: args.manifestExtras.generatedAt,
        },
        null,
        2,
      ),
    );
  }

  return await zip.generateAsync({ type: "blob" });
}
