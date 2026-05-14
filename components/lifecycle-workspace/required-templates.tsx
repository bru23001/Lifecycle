"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  BookOpen,
  Braces,
  ExternalLink,
  FileText,
  ListChecks,
  Package,
  Pencil,
  Plus,
  X,
} from "lucide-react";

import type { RequiredTemplate } from "@/components/lifecycle-workspace/required-templates-types";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function templateStatusLabel(status: RequiredTemplate["status"]): string {
  switch (status) {
    case "completed":
      return "Completed";
    case "in_progress":
      return "In Progress";
    case "not_started":
      return "Not Started";
    case "changes_requested":
      return "Changes Requested";
  }
}

function TemplateStatusBadge({ status }: { status: RequiredTemplate["status"] }) {
  const label = templateStatusLabel(status);
  const cls =
    status === "completed"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100"
      : status === "in_progress"
        ? "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-100"
        : status === "changes_requested"
          ? "border-violet-300 bg-violet-50 text-violet-950 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-100"
          : "border-border bg-muted text-muted-foreground";

  return (
    <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", cls)}>
      {label}
    </span>
  );
}

function RightDrawer({
  open,
  title,
  onClose,
  children,
  footer,
  testId,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  testId: string;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close drawer" onClick={onClose} />
      <div
        data-testid={testId}
        className="relative flex h-full w-full max-w-lg flex-col border-l border-border bg-[var(--app-bg)] shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground hover:bg-muted"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 text-sm">{children}</div>
        {footer ? <footer className="border-t border-border px-4 py-3">{footer}</footer> : null}
      </div>
    </div>
  );
}

function TemplatePreviewBody({ row }: { row: RequiredTemplate }) {
  const sections = row.previewSections ?? [];
  return (
    <div className="space-y-4 text-[13px]">
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground">Template metadata</p>
        <p className="mt-1 font-mono text-sm text-foreground">{row.templateCode}</p>
        <p className="mt-0.5 text-foreground/90">{row.name}</p>
        <p className="mt-1 text-muted-foreground">{row.description}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground">Required sections</p>
        {sections.length === 0 ? (
          <p className="mt-1 text-muted-foreground">No catalog sections available for this template.</p>
        ) : (
          <ul className="mt-2 list-inside list-disc space-y-1 text-foreground/90">
            {sections.map((s) => (
              <li key={s.id}>
                {s.title}{" "}
                <span className="text-muted-foreground">
                  ({s.requiredFieldCount}/{s.fieldCount} required fields)
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground">Markdown / JSON</p>
        <p className="mt-1 text-muted-foreground">
          Structured answers compile to Markdown narrative and JSON evidence payloads in the Template Wizard previews.
        </p>
      </div>
    </div>
  );
}

function TemplateValidationBody({ row }: { row: RequiredTemplate }) {
  const issues = row.validationIssues ?? [];
  return (
    <div className="space-y-3 text-[13px]">
      <div>
        <p className="font-medium text-foreground">{row.templateCode}</p>
        <p className="text-muted-foreground">{row.name}</p>
        <p className="mt-2 text-xs text-muted-foreground">Completion</p>
        <p className="font-semibold tabular-nums text-foreground">{row.progressPercent}%</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground">Issues</p>
        {issues.length === 0 ? (
          <p className="mt-1 text-muted-foreground">No catalog validation issues for this template.</p>
        ) : (
          <ul className="mt-2 list-inside list-disc space-y-1 text-foreground/90">
            {issues.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-muted-foreground">Evidence requirements</p>
        <p className="mt-1 text-muted-foreground">
          Link finalized exports as evidence before requesting gate review for this phase.
        </p>
      </div>
    </div>
  );
}

export type RequiredTemplatesProps = {
  templates: RequiredTemplate[];
  defaultArtifactOwnerName: string;
};

export function RequiredTemplates({ templates, defaultArtifactOwnerName }: RequiredTemplatesProps) {
  const router = useRouter();
  const [previewRow, setPreviewRow] = useState<RequiredTemplate | null>(null);
  const [validationRow, setValidationRow] = useState<RequiredTemplate | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createTemplateCode, setCreateTemplateCode] = useState(templates[0]?.templateCode ?? "");
  const [artifactName, setArtifactName] = useState("");
  const [artifactCode, setArtifactCode] = useState("");
  const [owner, setOwner] = useState(defaultArtifactOwnerName);
  const [linkedPhase, setLinkedPhase] = useState(String(templates[0]?.workspacePhaseNumber ?? 1));
  const [linkedGate, setLinkedGate] = useState(templates[0]?.gateCode ?? "");
  const [initialStatus, setInitialStatus] = useState("Draft");

  useEffect(() => {
    setOwner(defaultArtifactOwnerName);
  }, [defaultArtifactOwnerName]);

  useEffect(() => {
    const first = templates[0];
    if (!first) return;
    setCreateTemplateCode(first.templateCode);
    setLinkedPhase(String(first.workspacePhaseNumber ?? 1));
    setLinkedGate(first.gateCode ?? "");
  }, [templates]);

  const selectedForCreate = templates.find((t) => t.templateCode === createTemplateCode) ?? templates[0];

  function openCreate() {
    const first = templates[0];
    if (first) {
      setCreateTemplateCode(first.templateCode);
      setLinkedPhase(String(first.workspacePhaseNumber ?? 1));
      setLinkedGate(first.gateCode ?? "");
      setArtifactName(`${first.templateCode} artifact`);
      setArtifactCode(`${first.templateCode}-001`);
    }
    setCreateOpen(true);
  }

  function continueToWizard() {
    const row = templates.find((t) => t.templateCode === createTemplateCode);
    if (!row) return;
    const q = new URLSearchParams({
      mode: "create",
      artifactName: artifactName.trim() || `${row.templateCode} artifact`,
      artifactCode: artifactCode.trim() || `${row.templateCode}-001`,
      owner: owner.trim() || defaultArtifactOwnerName,
      phase: linkedPhase.trim() || "1",
      gate: linkedGate.trim() || "",
      status: initialStatus,
    });
    setCreateOpen(false);
    router.push(`${row.href}?${q.toString()}`);
  }

  const iconLinkClass = cn(
    buttonVariants({ variant: "ghost", size: "icon-xs" }),
    "text-muted-foreground",
  );

  const count = templates.length;

  return (
    <section
      id="required-templates"
      aria-labelledby="required-templates-heading"
      className="required-templates rounded-lg border bg-card shadow-sm"
    >
      <div className="card-header flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 id="required-templates-heading" className="flex items-center gap-2 text-sm font-semibold">
            <span className="inline-flex size-5 items-center justify-center rounded bg-[#e7f0ff]">
              <ListChecks className="size-3.5 text-[#2563eb]" aria-hidden />
            </span>
            Required templates
          </h3>
          <span
            className="count-badge rounded-full bg-muted px-2 py-0.5 text-xs font-semibold tabular-nums text-foreground"
            aria-label={`${count} templates`}
          >
            {count}
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          type="button"
          data-testid="create-from-template"
          onClick={openCreate}
          disabled={templates.length === 0}
        >
          <Plus className="size-3.5" />
          Create from template
        </Button>
      </div>
      <div className="card-scroll-area">
        <div>
          <table className="template-table w-full min-w-[720px] text-[13px]">
            <thead>
              <tr className="border-b bg-muted/30 text-left text-[11px] font-semibold text-muted-foreground">
                <th className="px-4 py-2.5">Template</th>
                <th className="px-4 py-2.5">Description</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5">Progress</th>
                <th className="px-4 py-2.5">Last updated</th>
                <th className="px-4 py-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer border-b last:border-0 hover:bg-muted/20"
                  data-testid="required-template-row"
                  onClick={() => router.push(row.href)}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-start gap-2 font-medium">
                      <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                      <div className="min-w-0">
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-normal text-foreground">
                          {row.templateCode}
                        </code>
                        <div className="mt-0.5 truncate text-sm">
                          <Link
                            href={row.href}
                            className="text-[#2563eb] hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {row.name}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="max-w-xs px-4 py-3 text-muted-foreground">{row.description}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="text-left"
                      data-testid="template-validation-status"
                      onClick={(e) => {
                        e.stopPropagation();
                        setValidationRow(row);
                      }}
                    >
                      <TemplateStatusBadge status={row.status} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-[#2563eb]"
                          style={{ width: `${row.progressPercent}%` }}
                        />
                      </div>
                      <span className="tabular-nums text-xs text-muted-foreground">{row.progressPercent}%</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {row.lastUpdatedLabel ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div
                      className="flex flex-wrap items-center justify-end gap-0.5"
                      role="group"
                      aria-label={`Actions for ${row.templateCode}`}
                    >
                      <button
                        type="button"
                        className={iconLinkClass}
                        aria-label={`Preview ${row.templateCode}`}
                        data-testid="preview-template"
                        onClick={() => setPreviewRow(row)}
                      >
                        <BookOpen className="size-4" />
                      </button>
                      <Link href={row.href} className={iconLinkClass} aria-label={`Edit ${row.templateCode}`}>
                        <Pencil className="size-4" />
                      </Link>
                      <Link
                        href={`${row.href}?evidence=json`}
                        className={iconLinkClass}
                        aria-label={`JSON evidence preview for ${row.templateCode}`}
                      >
                        <Braces className="size-4" />
                      </Link>
                      {row.artifactDetailHref ? (
                        <Link
                          href={row.artifactDetailHref}
                          className={iconLinkClass}
                          aria-label={`View generated artifact for ${row.templateCode}`}
                          data-testid="view-generated-artifact"
                        >
                          <Package className="size-4" />
                        </Link>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <RightDrawer
        open={previewRow != null}
        title="Template preview"
        onClose={() => setPreviewRow(null)}
        testId="template-preview-drawer"
        footer={
          previewRow ? (
            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setPreviewRow(null)}>
                Close
              </Button>
              <Link
                href={previewRow.href}
                className={cn(buttonVariants({ size: "sm" }), "inline-flex gap-1")}
              >
                Use template
                <ExternalLink className="size-3.5" />
              </Link>
            </div>
          ) : null
        }
      >
        {previewRow ? <TemplatePreviewBody row={previewRow} /> : null}
      </RightDrawer>

      <RightDrawer
        open={validationRow != null}
        title="Template validation"
        onClose={() => setValidationRow(null)}
        testId="template-validation-drawer"
        footer={
          validationRow ? (
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setValidationRow(null)}>
                Close
              </Button>
              <Link href={validationRow.href} className={buttonVariants({ size: "sm" })}>
                Open Template Wizard
              </Link>
            </div>
          ) : null
        }
      >
        {validationRow ? <TemplateValidationBody row={validationRow} /> : null}
      </RightDrawer>

      {createOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" role="presentation">
          <div
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl"
            data-testid="create-artifact-from-template-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-artifact-title"
          >
            <div className="flex items-start justify-between gap-2">
              <h2 id="create-artifact-title" className="text-lg font-semibold text-foreground">
                Create artifact from template
              </h2>
              <button
                type="button"
                className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                onClick={() => setCreateOpen(false)}
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <label className="block space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Template</span>
                <select
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5"
                  value={createTemplateCode}
                  onChange={(e) => {
                    const code = e.target.value;
                    setCreateTemplateCode(code);
                    const t = templates.find((x) => x.templateCode === code);
                    if (t) {
                      setLinkedPhase(String(t.workspacePhaseNumber ?? 1));
                      setLinkedGate(t.gateCode ?? "");
                      setArtifactName(`${code} artifact`);
                      setArtifactCode(`${code}-001`);
                    }
                  }}
                >
                  {templates.map((t) => (
                    <option key={t.templateCode} value={t.templateCode}>
                      {t.templateCode} — {t.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Artifact name</span>
                <input
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5"
                  value={artifactName}
                  onChange={(e) => setArtifactName(e.target.value)}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Artifact code</span>
                <input
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5"
                  value={artifactCode}
                  onChange={(e) => setArtifactCode(e.target.value)}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Owner</span>
                <input
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Linked phase</span>
                <input
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5"
                  value={linkedPhase}
                  onChange={(e) => setLinkedPhase(e.target.value)}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Linked gate</span>
                <input
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5"
                  value={linkedGate}
                  onChange={(e) => setLinkedGate(e.target.value)}
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Initial status</span>
                <select
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5"
                  value={initialStatus}
                  onChange={(e) => setInitialStatus(e.target.value)}
                >
                  <option value="Draft">Draft</option>
                  <option value="In Review">In Review</option>
                  <option value="Final">Final</option>
                </select>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={continueToWizard} disabled={!selectedForCreate}>
                Continue to Template Wizard
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
