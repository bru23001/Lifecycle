import Link from "next/link";

import type { GateReviewData } from "@/types/gate-review.types";
import { RequiredInputStatusPill } from "@/components/gate-review/gate-review-shared-widgets";

function validationLabel(status: import("@/types/gate-review.types").RequiredGateInput["status"]): string {
  switch (status) {
    case "complete":
      return "Checks pass";
    case "needs_review":
      return "Awaiting review";
    case "incomplete":
      return "Needs completion";
    case "missing":
      return "Blocking";
    default:
      return "—";
  }
}

export function GateRequiredInputsFullPage({ data }: { data: GateReviewData }) {
  const { project, gateReviewHeader, requiredInputs } = data;
  const reviewHref = `/projects/${project.id}/gates/${gateReviewHeader.gateId}/review`;
  const title = `${gateReviewHeader.gateCode} — Required inputs`;

  return (
    <div className="min-h-full bg-background">
      <div className="border-b bg-card px-6 py-4">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <Link href="/projects" className="hover:text-foreground hover:underline">
            Projects
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <Link href={`/projects/${project.id}`} className="hover:text-foreground hover:underline">
            {project.name}
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <Link href={reviewHref} className="hover:text-foreground hover:underline">
            Gate review
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="font-medium text-foreground">Inputs</span>
        </nav>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Full list of templates and artifacts required for this gate package. Open an artifact, jump to the
          template wizard, or return to Gate Review.
        </p>
      </div>

      <div className="mx-auto max-w-[1200px] px-6 py-8">
        {requiredInputs.length === 0 ? (
          <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-50">
            No required inputs are configured for this gate in the current evaluation.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full min-w-[960px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Input</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Required</th>
                  <th className="px-4 py-3">Linked artifact</th>
                  <th className="px-4 py-3">Linked evidence</th>
                  <th className="px-4 py-3">Completion</th>
                  <th className="px-4 py-3">Validation</th>
                  <th className="px-4 py-3">Open</th>
                </tr>
              </thead>
              <tbody>
                {requiredInputs.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-b-0">
                    <td className="px-4 py-3 font-semibold text-foreground">
                      <span className="font-mono text-xs text-muted-foreground">{row.inputCode}</span>
                      <span className="mt-0.5 block">{row.name}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">Template</td>
                    <td className="px-4 py-3 text-foreground">Yes</td>
                    <td className="px-4 py-3">
                      {row.href ? (
                        <Link href={row.href} className="font-medium text-primary hover:underline">
                          View artifact
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="max-w-[200px] px-4 py-3 text-muted-foreground">
                      {row.linkedEvidenceLabels?.length ?
                        row.linkedEvidenceLabels.join(", ")
                      : "—"}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{row.provided ? "Yes" : "No"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <RequiredInputStatusPill status={row.status} />
                        <span className="text-xs text-muted-foreground">{validationLabel(row.status)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5">
                        {row.href ? (
                          <Link
                            href={row.href}
                            className="inline-flex text-xs font-semibold text-primary hover:underline"
                            data-testid={`gate-input-open-artifact-${row.inputCode}`}
                          >
                            Artifact
                          </Link>
                        ) : null}
                        {row.wizardHref ? (
                          <Link
                            href={row.wizardHref}
                            className="inline-flex text-xs font-semibold text-primary hover:underline"
                            data-testid={`gate-input-open-template-${row.inputCode}`}
                          >
                            Template
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8">
          <Link
            href={reviewHref}
            className="text-sm font-semibold text-primary hover:underline"
            data-testid="gate-inputs-back-to-review"
          >
            ← Back to gate review
          </Link>
        </div>
      </div>
    </div>
  );
}
