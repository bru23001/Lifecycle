"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { recordGateReview } from "@/app/actions/recordGateReview";
import { Button, buttonVariants } from "@/components/ui/button";
import type { GateEvaluationResult, GateId } from "@/lib/gateRules";
import { toUserMessage } from "@/lib/toUserMessage";
import { cn } from "@/lib/utils";

const DECISIONS = [
  "Accepted",
  "Conditional",
  "Returned",
  "Deferred",
  "Rejected",
] as const;

const inputClassName =
  "w-full rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

type Props = {
  projectId: string;
  projectName: string;
  gateId: GateId;
  initialEvaluation: GateEvaluationResult;
  initialPhase: number;
};

export function GateReviewForm({
  projectId,
  projectName,
  gateId,
  initialEvaluation,
  initialPhase,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [decision, setDecision] = useState<(typeof DECISIONS)[number]>("Accepted");
  const [authorityName, setAuthorityName] = useState("");
  const [authorityRole, setAuthorityRole] = useState("");
  const [nextAction, setNextAction] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [blocking, setBlocking] = useState<string[] | null>(null);

  const evaluation = initialEvaluation;

  const { failedCount, passedCount, allPassed } = useMemo(() => {
    const failed = evaluation.checks.filter((c) => !c.ok).length;
    const passed = evaluation.checks.filter((c) => c.ok).length;
    return {
      failedCount: failed,
      passedCount: passed,
      allPassed: failed === 0,
    };
  }, [evaluation.checks]);

  const advanceBlocked =
    (decision === "Accepted" || decision === "Conditional") && !allPassed;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBlocking(null);
    startTransition(async () => {
      try {
        const res = await recordGateReview({
          projectId,
          gateId,
          decision,
          authorityName,
          authorityRole,
          nextAction,
        });
        if (!res.ok) {
          setError(toUserMessage(res.error));
          setBlocking(res.blockingMessages ?? null);
          return;
        }
        router.push(`/projects/${projectId}`);
        router.refresh();
      } catch (e) {
        setError(toUserMessage(e));
        setBlocking(null);
      }
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      <header className="space-y-1">
        <p className="text-sm text-muted-foreground">
          <Link href="/" className="underline-offset-4 hover:underline">
            Home
          </Link>
          <span className="text-muted-foreground"> · </span>
          <Link href="/projects" className="underline-offset-4 hover:underline">
            Projects
          </Link>
          <span className="text-muted-foreground"> · </span>
          <Link
            href={`/projects/${projectId}`}
            className="underline-offset-4 hover:underline"
          >
            {projectName}
          </Link>
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Gate {gateId} review
        </h1>
        <p className="text-sm text-muted-foreground">
          Current lifecycle phase:{" "}
          <span className="font-medium text-foreground">{initialPhase}</span>
        </p>
      </header>

      <section
        className="rounded-2xl border bg-card p-5 shadow-sm"
        aria-labelledby="evidence-heading"
      >
        <h2 id="evidence-heading" className="text-lg font-semibold">
          Evidence checks
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          <strong className="font-medium text-foreground">Accepted</strong> and{" "}
          <strong className="font-medium text-foreground">Conditional</strong> require
          every check below to pass before the project phase can advance.
        </p>

        <div
          className={cn(
            "mt-4 rounded-xl border px-4 py-3 text-sm",
            allPassed
              ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-950 dark:text-emerald-100"
              : "border-amber-500/40 bg-amber-500/5 text-amber-950 dark:text-amber-50",
          )}
          role="status"
        >
          <span className="font-semibold">
            {passedCount} passed
            {failedCount > 0 ? ` · ${failedCount} need attention` : ""}
          </span>
          {!allPassed ? (
            <span className="mt-1 block text-xs text-muted-foreground">
              Resolve failing checks or choose Returned / Rejected / Deferred with a
              clear next action.
            </span>
          ) : null}
        </div>

        <ul className="mt-4 space-y-2" aria-label="Evidence check results">
          {evaluation.checks.map((c) => (
            <li
              key={c.id}
              className={cn(
                "flex gap-3 rounded-lg border px-3 py-3 text-sm",
                c.ok
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : "border-destructive/40 bg-destructive/5",
              )}
            >
              <span
                className={cn(
                  "inline-flex min-w-[4.5rem] shrink-0 items-center justify-center rounded-md px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
                  c.ok
                    ? "bg-emerald-600/15 text-emerald-900 dark:text-emerald-100"
                    : "bg-destructive/15 text-destructive",
                )}
              >
                {c.ok ? "Pass" : "Fail"}
              </span>
              <span className="leading-snug">{c.message}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Rules align with Master Lifecycle Decision Gates §5 and template schemas.
        </p>
      </section>

      <form
        onSubmit={onSubmit}
        className="space-y-6 rounded-2xl border bg-card p-5 shadow-sm"
        aria-labelledby="decision-heading"
      >
        <h2 id="decision-heading" className="text-lg font-semibold">
          Decision record
        </h2>

        {advanceBlocked ? (
          <div
            role="alert"
            className="rounded-xl border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-50"
          >
            <strong className="font-semibold">Heads up:</strong>{" "}
            {decision} is blocked until all evidence checks pass. Change the decision
            or fix the failing checks first.
          </div>
        ) : null}

        <div className="grid gap-2">
          <label htmlFor="decision" className="text-sm font-medium">
            Decision
          </label>
          <select
            id="decision"
            value={decision}
            onChange={(e) =>
              setDecision(e.target.value as (typeof DECISIONS)[number])
            }
            className={inputClassName}
          >
            {DECISIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <label htmlFor="authorityName" className="text-sm font-medium">
              Authority name
            </label>
            <input
              id="authorityName"
              value={authorityName}
              onChange={(e) => setAuthorityName(e.target.value)}
              required
              minLength={2}
              className={inputClassName}
              placeholder="Reviewer or sponsor name"
              autoComplete="name"
            />
          </div>
          <div className="grid gap-2">
            <label htmlFor="authorityRole" className="text-sm font-medium">
              Authority role
            </label>
            <input
              id="authorityRole"
              value={authorityRole}
              onChange={(e) => setAuthorityRole(e.target.value)}
              required
              minLength={2}
              className={inputClassName}
              placeholder="e.g. Product Owner, Governance Reviewer"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <label htmlFor="nextAction" className="text-sm font-medium">
            Next action
          </label>
          <textarea
            id="nextAction"
            value={nextAction}
            onChange={(e) => setNextAction(e.target.value)}
            required
            minLength={5}
            rows={4}
            className={inputClassName}
            placeholder="If the gate fails: what happens next, who owns it, and by when. If it passes: confirm downstream kickoff."
          />
        </div>

        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            <p>{error}</p>
            {blocking?.length ? (
              <ul className="mt-2 list-inside list-disc space-y-1">
                {blocking.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" size="lg" disabled={pending || advanceBlocked}>
            {pending ? "Recording…" : "Record gate decision"}
          </Button>
          <Link
            href={`/projects/${projectId}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "inline-flex items-center justify-center no-underline",
            )}
          >
            Back to project
          </Link>
        </div>
      </form>
    </div>
  );
}
