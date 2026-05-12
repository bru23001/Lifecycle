"use client";

import { useActionState } from "react";

import {
  NEW_PROJECT_LIFECYCLE_MODELS,
  NEW_PROJECT_WORKFLOW_STATUSES,
} from "@/data/new-project.constants";
import { createProject, type CreateProjectState } from "@/app/projects/new/actions";
import { WORKSPACE_PHASES } from "@/lib/workspacePhases";

function fieldClass(hasError: boolean): string {
  return [
    "mt-1 w-full rounded-md border bg-white px-3 py-2 text-[12px] text-slate-900 shadow-sm outline-none",
    hasError ? "border-rose-400 focus:border-rose-500" : "border-slate-200 focus:border-[#2563eb]",
  ].join(" ");
}

export function NewProjectForm({
  defaultOwnerName,
  intent,
}: {
  defaultOwnerName: string;
  intent: string | null;
}) {
  const [state, formAction, isPending] = useActionState<CreateProjectState, FormData>(
    createProject,
    {},
  );

  return (
    <form action={formAction} className="space-y-8">
      {intent === "create-template" ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-950">
          You opened this screen from template settings. Create the project here, then return to
          Settings to register or edit templates for this workspace.
        </p>
      ) : null}

      {state.error ? (
        <p
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] text-rose-900"
          role="alert"
        >
          {state.error}
        </p>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900">Project identity</h2>
        <div className="grid gap-4 min-[640px]:grid-cols-2">
          <div>
            <label htmlFor="new-project-name" className="text-[11px] font-semibold text-slate-600">
              Project name <span className="text-rose-600">*</span>
            </label>
            <input
              id="new-project-name"
              name="name"
              type="text"
              required
              autoComplete="off"
              className={fieldClass(Boolean(state.fieldErrors?.name))}
              placeholder="e.g. Northwind modernization"
            />
            {state.fieldErrors?.name ? (
              <p className="mt-1 text-[11px] text-rose-600">{state.fieldErrors.name}</p>
            ) : null}
          </div>
          <div>
            <label
              htmlFor="new-project-code"
              className="text-[11px] font-semibold text-slate-600"
            >
              Project code / URL slug <span className="text-rose-600">*</span>
            </label>
            <input
              id="new-project-code"
              name="codeSlug"
              type="text"
              required
              autoComplete="off"
              className={fieldClass(Boolean(state.fieldErrors?.codeSlug))}
              placeholder="e.g. northwind-mod"
            />
            {state.fieldErrors?.codeSlug ? (
              <p className="mt-1 text-[11px] text-rose-600">{state.fieldErrors.codeSlug}</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900">Lifecycle & ownership</h2>
        <div className="grid gap-4 min-[640px]:grid-cols-2">
          <div>
            <label
              htmlFor="new-project-lifecycle"
              className="text-[11px] font-semibold text-slate-600"
            >
              Lifecycle model <span className="text-rose-600">*</span>
            </label>
            <select
              id="new-project-lifecycle"
              name="lifecycleModel"
              required
              defaultValue=""
              className={fieldClass(Boolean(state.fieldErrors?.lifecycleModel))}
            >
              <option value="" disabled>
                Select a model…
              </option>
              {NEW_PROJECT_LIFECYCLE_MODELS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            {state.fieldErrors?.lifecycleModel ? (
              <p className="mt-1 text-[11px] text-rose-600">{state.fieldErrors.lifecycleModel}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="new-project-owner" className="text-[11px] font-semibold text-slate-600">
              Owner (display name) <span className="text-rose-600">*</span>
            </label>
            <input
              id="new-project-owner"
              name="owner"
              type="text"
              required
              defaultValue={defaultOwnerName}
              autoComplete="name"
              className={fieldClass(Boolean(state.fieldErrors?.owner))}
            />
            {state.fieldErrors?.owner ? (
              <p className="mt-1 text-[11px] text-rose-600">{state.fieldErrors.owner}</p>
            ) : null}
          </div>
        </div>
        <div className="grid gap-4 min-[640px]:grid-cols-2">
          <div>
            <label htmlFor="new-project-status" className="text-[11px] font-semibold text-slate-600">
              Status <span className="text-rose-600">*</span>
            </label>
            <select
              id="new-project-status"
              name="workflowStatus"
              required
              defaultValue="Not Started"
              className={fieldClass(Boolean(state.fieldErrors?.workflowStatus))}
            >
              {NEW_PROJECT_WORKFLOW_STATUSES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            {state.fieldErrors?.workflowStatus ? (
              <p className="mt-1 text-[11px] text-rose-600">{state.fieldErrors.workflowStatus}</p>
            ) : null}
          </div>
          <div>
            <label
              htmlFor="new-project-phase"
              className="text-[11px] font-semibold text-slate-600"
            >
              Initial workspace phase <span className="text-rose-600">*</span>
            </label>
            <select
              id="new-project-phase"
              name="initialPhase"
              required
              defaultValue="1"
              className={fieldClass(Boolean(state.fieldErrors?.initialPhase))}
            >
              {WORKSPACE_PHASES.map((phase) => (
                <option key={phase.index} value={String(phase.index)}>
                  {phase.index}. {phase.title}
                </option>
              ))}
            </select>
            {state.fieldErrors?.initialPhase ? (
              <p className="mt-1 text-[11px] text-rose-600">{state.fieldErrors.initialPhase}</p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold tracking-tight text-slate-900">Scope</h2>
        <div>
          <label htmlFor="new-project-scope" className="text-[11px] font-semibold text-slate-600">
            Scope summary <span className="text-rose-600">*</span>
          </label>
          <textarea
            id="new-project-scope"
            name="scope"
            required
            rows={4}
            className={fieldClass(Boolean(state.fieldErrors?.scope))}
            placeholder="Outcomes, boundaries, and key deliverables for this lifecycle."
          />
          {state.fieldErrors?.scope ? (
            <p className="mt-1 text-[11px] text-rose-600">{state.fieldErrors.scope}</p>
          ) : null}
        </div>
        <div>
          <label
            htmlFor="new-project-description"
            className="text-[11px] font-semibold text-slate-600"
          >
            Description <span className="text-slate-400">(optional)</span>
          </label>
          <textarea
            id="new-project-description"
            name="description"
            rows={3}
            className={fieldClass(false)}
            placeholder="Additional context for reviewers."
          />
        </div>
        <div>
          <label
            htmlFor="new-project-storage"
            className="text-[11px] font-semibold text-slate-600"
          >
            Evidence vault folder label <span className="text-slate-400">(optional)</span>
          </label>
          <input
            id="new-project-storage"
            name="storageLocation"
            type="text"
            autoComplete="off"
            className={fieldClass(false)}
            placeholder="Defaults to IDEA-0001 when empty"
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 items-center justify-center rounded-md bg-[#2563eb] px-5 text-[12px] font-semibold text-white disabled:opacity-60"
        >
          {isPending ? "Creating…" : "Create project"}
        </button>
      </div>
    </form>
  );
}
