import Link from "next/link";

import { NewProjectForm } from "@/components/projects/new-project-form";

export const dynamic = "force-dynamic";

export default function NewProjectPage() {
  return (
    <main className="min-h-screen bg-[#f8fafc] px-8 py-10 text-slate-900">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create New Project</h1>
            <p className="mt-2 text-sm text-slate-600">
              Define the lifecycle container. After creation you&apos;ll land in the lifecycle workspace for Phase 1.
            </p>
          </div>
          <Link
            href="/projects"
            className="text-sm font-semibold text-[#1d4ed8] underline-offset-4 hover:underline"
          >
            Back to projects
          </Link>
        </div>

        <NewProjectForm />
      </div>
    </main>
  );
}
