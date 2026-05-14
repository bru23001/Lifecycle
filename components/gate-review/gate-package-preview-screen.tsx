import Link from "next/link";

import { PhaseValidationExportButton } from "@/components/lifecycle-workspace/phase-validation-export-button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GateReviewData } from "@/types/gate-review.types";

export function GatePackagePreviewScreen({ data }: { data: GateReviewData }) {
  const { project, gateReviewHeader, gateOverview, requiredInputs, completionEvidence, decisionCriteria } = data;
  const workspaceSubmitHref = `${gateOverview.phaseWorkspaceHref}#submit-for-gate-review`;
  const reviewHref = `/projects/${project.id}/gates/${gateReviewHeader.gateId}/review`;
  const traceHref = `/projects/${project.id}/traceability`;

  const exportPayload = {
    exportedAt: new Date().toISOString(),
    kind: "gate_package_preview",
    projectId: project.id,
    projectName: project.name,
    gate: {
      code: gateReviewHeader.gateCode,
      name: gateReviewHeader.gateName,
    },
    requiredInputs,
    evidence: completionEvidence,
    decisionCriteria,
  };

  const completedArtifacts = requiredInputs.filter((i) => i.status === "complete");

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 text-sm" data-testid="gate-package-preview">
      <header className="space-y-2 border-b border-border pb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Gate {gateReviewHeader.gateCode}
        </p>
        <h1 className="text-2xl font-semibold text-foreground">Gate package preview</h1>
        <p className="text-muted-foreground">
          Read-only snapshot of what reviewers will see for {gateReviewHeader.gateName}. This does not record a
          decision.
        </p>
      </header>

      <section>
        <h2 className="text-sm font-semibold text-foreground">Gate overview</h2>
        <p className="mt-2 whitespace-pre-wrap text-foreground/90">{gateOverview.purpose}</p>
        <ul className="mt-3 list-inside list-disc text-muted-foreground">
          {gateOverview.successCriteria.slice(0, 6).map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-foreground">Phase summary</h2>
        <p className="mt-2 text-foreground/90">{gateOverview.currentPhaseLabel}</p>
        <p className="mt-1 text-xs text-muted-foreground">Workspace progress: {gateOverview.phaseProgressPercent}%</p>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-foreground">Required inputs</h2>
        <ul className="mt-2 space-y-1">
          {requiredInputs.map((i) => (
            <li key={i.id} className="text-foreground/90">
              <span className="font-medium">{i.name}</span> — {i.status}
              {i.href ? (
                <>
                  {" "}
                  <Link href={i.href} className="text-primary underline">
                    Open
                  </Link>
                </>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-foreground">Artifact package</h2>
        <p className="mt-2 text-xs text-muted-foreground">Finalized artifacts represented in required inputs.</p>
        <ul className="mt-2 list-inside list-disc text-foreground/90">
          {completedArtifacts.length === 0 ? (
            <li>No artifacts marked complete for this gate yet.</li>
          ) : (
            completedArtifacts.map((i) => <li key={`done-${i.id}`}>{i.name}</li>)
          )}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-foreground">Evidence package</h2>
        {completionEvidence.length === 0 ? (
          <p className="mt-2 text-muted-foreground">No evidence items linked for this gate.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {completionEvidence.map((e) => (
              <li key={e.id}>
                <Link href={e.href} className="text-primary underline">
                  {e.name}
                </Link>
                <span className="text-muted-foreground"> · {e.addedOnLabel}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-foreground">Validation report</h2>
        <p className="mt-2 text-foreground/90">
          Automated gate checks ({decisionCriteria.criteria.length} criteria). Overall:{" "}
          <span className="font-medium">{decisionCriteria.overallAssessment.replace(/_/g, " ")}</span>
        </p>
        <ul className="mt-2 list-inside list-disc text-muted-foreground">
          {decisionCriteria.criteria.map((c) => (
            <li key={c.id}>
              {c.name}: {c.assessment.replace(/_/g, " ")}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-foreground">Traceability links</h2>
        <p className="mt-2 text-muted-foreground">
          Requirement-to-artifact and test coverage links are maintained in the traceability matrix.
        </p>
        <Link href={traceHref} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-3 inline-flex")}>
          Open traceability matrix
        </Link>
      </section>

      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <PhaseValidationExportButton exportPayload={exportPayload} filename={`gate-${gateReviewHeader.gateId}-package-preview.json`} />
        <Link href={workspaceSubmitHref} className={cn(buttonVariants({ variant: "default", size: "default" }))}>
          Submit for review (workspace)
        </Link>
        <Link href={reviewHref} className={cn(buttonVariants({ variant: "secondary", size: "default" }))}>
          Open gate review
        </Link>
      </div>
    </div>
  );
}
