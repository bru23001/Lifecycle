"use client";

import { useActionState } from "react";
import Link from "next/link";

import { createProject, type CreateProjectState } from "@/app/projects/new/actions";
import { Button } from "@/components/ui/button";

const initialState: CreateProjectState = {};

export function NewProjectForm() {
  const [state, formAction, pending] = useActionState(createProject, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-6">
      {state.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {state.error}
        </div>
      ) : null}

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold text-slate-800">
            Project name <span className="text-red-600">*</span>
          </span>
          <input
            name="name"
            required
            autoComplete="organization"
            className="h-10 rounded-lg border border-slate-200 px-3 text-slate-900 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-blue-600"
            placeholder="e.g. Secure Identity Platform"
            aria-invalid={Boolean(state.fieldErrors?.name)}
            aria-describedby={state.fieldErrors?.name ? "err-name" : undefined}
          />
          {state.fieldErrors?.name ? (
            <span id="err-name" className="text-xs text-red-600">
              {state.fieldErrors.name}
            </span>
          ) : null}
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold text-slate-800">
            Project code / slug <span className="text-red-600">*</span>
          </span>
          <input
            name="codeSlug"
            required
            className="h-10 rounded-lg border border-slate-200 px-3 font-mono text-slate-900 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-blue-600"
            placeholder="e.g. sip-001"
            aria-invalid={Boolean(state.fieldErrors?.codeSlug)}
            aria-describedby={state.fieldErrors?.codeSlug ? "err-slug" : undefined}
          />
          {state.fieldErrors?.codeSlug ? (
            <span id="err-slug" className="text-xs text-red-600">
              {state.fieldErrors.codeSlug}
            </span>
          ) : (
            <span className="text-xs text-slate-500">Used for URLs and uniqueness.</span>
          )}
        </label>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold text-slate-800">Project type</span>
          <select
            name="projectType"
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-slate-900 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-blue-600"
            defaultValue="platform"
          >
            <option value="platform">Platform</option>
            <option value="product">Product</option>
            <option value="program">Program</option>
            <option value="initiative">Initiative</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold text-slate-800">
            Owner <span className="text-red-600">*</span>
          </span>
          <input
            name="owner"
            required
            className="h-10 rounded-lg border border-slate-200 px-3 text-slate-900 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-blue-600"
            placeholder="Name or role"
            aria-invalid={Boolean(state.fieldErrors?.owner)}
          />
          {state.fieldErrors?.owner ? (
            <span className="text-xs text-red-600">{state.fieldErrors.owner}</span>
          ) : null}
        </label>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold text-slate-800">Business area</span>
          <input
            name="businessArea"
            className="h-10 rounded-lg border border-slate-200 px-3 text-slate-900 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-blue-600"
            placeholder="e.g. Security, Finance"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-semibold text-slate-800">
            Lifecycle model <span className="text-red-600">*</span>
          </span>
          <select
            name="lifecycleModel"
            required
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-slate-900 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-blue-600"
            defaultValue="standard_14"
            aria-invalid={Boolean(state.fieldErrors?.lifecycleModel)}
          >
            <option value="standard_14">Standard 14-Phase</option>
            <option value="lightweight_9">Lightweight 9-Phase</option>
            <option value="regulated">Regulated / Extended</option>
          </select>
          {state.fieldErrors?.lifecycleModel ? (
            <span className="text-xs text-red-600">{state.fieldErrors.lifecycleModel}</span>
          ) : null}
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold text-slate-800">
          Storage location <span className="text-red-600">*</span>
        </span>
        <input
          name="storageLocation"
          required
          className="h-10 rounded-lg border border-slate-200 px-3 font-mono text-sm text-slate-900 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-blue-600"
          placeholder="e.g. IDEA-0042 or vault root folder ID"
          defaultValue="IDEA-0001"
          aria-invalid={Boolean(state.fieldErrors?.storageLocation)}
        />
        {state.fieldErrors?.storageLocation ? (
          <span className="text-xs text-red-600">{state.fieldErrors.storageLocation}</span>
        ) : (
          <span className="text-xs text-slate-500">Maps to evidence vault folder on the project record.</span>
        )}
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-semibold text-slate-800">Initial description</span>
        <textarea
          name="description"
          rows={4}
          className="rounded-lg border border-slate-200 px-3 py-2 text-slate-900 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-blue-600"
          placeholder="Goals, scope, and constraints for this lifecycle container."
        />
      </label>

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">
        <Button type="submit" disabled={pending} className="min-w-[140px]">
          {pending ? "Creating…" : "Create project"}
        </Button>
        <Link
          href="/projects"
          className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
