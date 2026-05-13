import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { NewProjectForm } from "@/components/projects/new-project-form";
import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { getCurrentUserDisplay } from "@/lib/server/current-user";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{ intent?: string | string[] }>;
};

function searchParamFirst(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  const v = Array.isArray(value) ? value[0] : value;
  return typeof v === "string" ? v : undefined;
}

export default async function NewProjectPage({ searchParams }: PageProps) {
  const params = searchParams != null ? await searchParams : {};
  const intentRaw = searchParamFirst(params.intent);
  const intent = intentRaw?.trim() ? intentRaw.trim() : null;
  const user = await getCurrentUserDisplay();

  return (
    <AuthenticatedAppShell projectId={null} navActive="projects">
      <TopHeader
        title="New project"
        userInitials={user.initials}
        userName={user.name}
        userRole={user.role}
      />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto bg-[var(--app-bg)] text-[11px] text-foreground">
        <div className="mx-auto w-full max-w-[960px] px-5 pt-4 pb-8 min-[901px]:px-8">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Projects", href: "/projects" }, { label: "New project" }]} />
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/projects"
              className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-[12px] font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Back to projects
            </Link>
          </div>
          <div className="cc-card-standard mt-6 p-6 sm:p-8">
            <h1 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">Create project</h1>
            <p className="mt-2 max-w-prose text-[12px] leading-relaxed text-slate-600">
              Identity, business area, lifecycle model, owner, and starting phase. You will continue in the lifecycle
              workspace after the project is created.
            </p>
            <div className="mt-8">
              <NewProjectForm defaultOwnerName={user.name} intent={intent} />
            </div>
          </div>
        </div>
      </main>
    </AuthenticatedAppShell>
  );
}
