import Link from "next/link";
import { notFound } from "next/navigation";

import { GateReviewForm } from "@/components/gate-review-form";
import { normalizeGateParam } from "@/lib/gateNormalize";
import { evaluateGateForProject, type GateId } from "@/lib/gateRules";
import { indexLatestGateDecisions } from "@/lib/gateStatus";
import { canOpenGateReview } from "@/lib/phaseTransitions";
import { prisma } from "@/lib/prisma";

export default async function GateReviewPage({
  params,
}: {
  params: Promise<{ id: string; gateId: string }>;
}) {
  const { id, gateId: gateParam } = await params;
  const gateId = normalizeGateParam(gateParam);
  if (!gateId) {
    notFound();
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      gateDecisions: {
        orderBy: { createdAt: "desc" },
        select: {
          gateId: true,
          decision: true,
          evidencePassSnapshot: true,
          createdAt: true,
        },
      },
    },
  });
  if (!project) {
    notFound();
  }

  const latestByGate = indexLatestGateDecisions(project.gateDecisions);
  const eligibility = canOpenGateReview(
    project.currentPhase,
    gateId as GateId,
    latestByGate,
  );
  const evaluation = await evaluateGateForProject(project.id, gateId as GateId);

  if (!eligibility.ok) {
    return (
      <div className="min-h-full bg-background px-4 py-16 text-foreground">
        <div className="mx-auto max-w-lg rounded-2xl border bg-card p-8 shadow-sm">
          <h1 className="text-xl font-semibold tracking-tight">Gate {gateId}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{eligibility.reason}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Current phase:{" "}
            <span className="font-mono font-medium text-foreground">
              {project.currentPhase}
            </span>
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={`/projects/${id}`}
              className="inline-flex rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/60"
            >
              Project workspace
            </Link>
            <Link
              href="/projects"
              className="inline-flex rounded-lg border border-transparent px-4 py-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              All projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <GateReviewForm
        projectId={project.id}
        projectName={project.name}
        gateId={gateId as GateId}
        initialEvaluation={evaluation}
        initialPhase={project.currentPhase}
      />
    </div>
  );
}
