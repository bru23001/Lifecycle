"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

import { TopHeader } from "@/components/lifecycle-workspace/top-header";
import { AuthenticatedAppShell } from "@/components/lifecycle-workspace/authenticated-app-shell";
import type { AppSidebarActive } from "@/components/lifecycle-workspace/app-sidebar";
import { Breadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";
import { cn } from "@/lib/utils";
import type { SettingsPageData, TemplateRegistryItem } from "@/types/settings.types";

export async function putSettingsPageData(data: SettingsPageData): Promise<SettingsPageData> {
  const response = await fetch("/api/settings", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const payload = (await response.json()) as { error?: string; blockers?: string[] };
    throw new Error(payload.error ?? payload.blockers?.join(" ") ?? "Save failed.");
  }
  const payload = (await response.json()) as { data: SettingsPageData };
  return payload.data;
}

export function TemplateRegistryPageShell({
  user,
  breadcrumbs,
  children,
  navActive = "settings",
}: {
  user: SettingsPageData["user"];
  breadcrumbs: { label: string; href?: string }[];
  children: React.ReactNode;
  /** Sidebar highlight; template admin routes should pass `"template_registry"`. */
  navActive?: AppSidebarActive;
}) {
  return (
    <AuthenticatedAppShell projectId={null} navActive={navActive}>
      <TopHeader title="Settings" userInitials={user.initials} userName={user.name} userRole={user.role} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto bg-[var(--app-bg)]">
          <div className="mx-auto w-full max-w-[960px] px-5 py-6 min-[901px]:px-8">
            <Breadcrumbs items={breadcrumbs} />
            {children}
          </div>
        </main>
      </div>
    </AuthenticatedAppShell>
  );
}

export function TemplateSettingsDialog({
  open,
  title,
  onClose,
  children,
  footer,
  wide,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
    } else if (node.open) node.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40",
        wide ? "w-[min(100vw-2rem,720px)]" : "w-[min(100vw-2rem,520px)]",
      )}
      aria-labelledby="template-dialog-title"
    >
      <div className="flex max-h-[min(90vh,720px)] flex-col">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 id="template-dialog-title" className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="size-5" aria-hidden />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        <footer className="flex shrink-0 justify-end gap-2 border-t border-slate-100 px-5 py-4">{footer}</footer>
      </div>
    </dialog>
  );
}

export type TemplateFormDraft = {
  templateCode: string;
  name: string;
  phaseNumber: number;
  outputType: TemplateRegistryItem["outputType"];
  required: boolean;
  schemaVersion: string;
  sectionDefinitions: string;
  fieldDefinitions: string;
  validationRules: string;
  markdownRendererSettings: string;
  jsonEvidenceSettings: string;
  usageSummaryLabel: string;
};

const A0_EXAMPLES = {
  sectionDefinitions: [
    "WHAT TO WRITE: Number each screen/step in your form (the order people answer questions). One line per step.",
    "",
    "1. Idea Title",
    "2. Idea Sponsor and Date Submitted",
    "3. Short Idea Summary",
    "4. Problem or Opportunity",
    "5. Target Users or Beneficiaries",
    "6. Current Situation",
    "7. Expected Benefit",
    "8. Possible Software Solution",
    "9. Urgency or Timing",
    "10. Known Constraints",
    "11. Known Risks or Concerns",
    "12. Similar Existing Solutions",
    "13. Initial Complexity Estimate",
    "14. Recommendation",
    "15. Approval Status",
    "16. Review Record",
  ].join("\n"),
  fieldDefinitions: [
    "WHAT TO WRITE: For each question, list machine name, type, and rules. Copy this pattern for your own fields.",
    "",
    "ideaTitle: text, required, min=3",
    "ideaSponsor: text, required",
    "dateSubmitted: date, required, format=YYYY-MM-DD",
    "shortIdeaSummary: textarea, required, min=10",
    "problemOrOpportunity: textarea, required, min=10",
    "targetUsersOrBeneficiaries: textarea, required, min=5",
    "urgencyOrTiming: select[Low|Medium|High|Time-Critical|Unknown], required",
    "initialComplexityEstimate: select[Low|Medium|High|Enterprise|Unknown], required",
    "recommendation: select[Accept for Problem Definition|Research More|Park|Reject], required",
    "approvalStatus: select[Draft|Submitted|Approved|Returned|Deferred|Rejected], required",
  ].join("\n"),
  validationRules: [
    "WHAT TO WRITE: Plain-language rules reviewers use to say “this is complete enough.” Use bullets.",
    "",
    "- all required fields must be non-empty",
    "- dateSubmitted and reviewDate must be YYYY-MM-DD",
    "- text min lengths: title>=3, summary/problem>=10, rationale>=5",
    "- recommendation and approvalStatus must be from allowed enums",
    "- gate rule: approvalStatus must be Approved before G1 pass",
  ].join("\n"),
  markdownRendererSettings: [
    "WHAT TO WRITE: How answers should become Markdown (headings, bullets, what to skip if empty).",
    "",
    "- render section headings as ## <id>. <title>",
    "- include only non-empty fields",
    "- use bullet lists for enum fields",
    "- append review metadata block at end (reviewerName, reviewerRole, reviewDate)",
  ].join("\n"),
  jsonEvidenceSettings: [
    "WHAT TO WRITE: Optional JSON notes for exports/gates (required field ids, enums, gate checks). Valid JSON if you use { }.",
    "",
    "{",
    '  "outputVersion": "1.0",',
    '  "requiredFields": ["ideaTitle", "ideaSponsor", "dateSubmitted", "problemOrOpportunity"],',
    '  "enumFields": ["urgencyOrTiming", "initialComplexityEstimate", "recommendation", "approvalStatus"],',
    '  "gateChecks": { "G1": { "approvalStatus": "Approved" } }',
    "}",
  ].join("\n"),
} as const;

export function emptyTemplateFormDraft(): TemplateFormDraft {
  return {
    templateCode: "",
    name: "",
    phaseNumber: 1,
    outputType: "markdown",
    required: false,
    schemaVersion: "v1.0.0",
    sectionDefinitions: "",
    fieldDefinitions: "",
    validationRules: "",
    markdownRendererSettings: "",
    jsonEvidenceSettings: "",
    usageSummaryLabel: "",
  };
}

export function templateItemToFormDraft(item: TemplateRegistryItem): TemplateFormDraft {
  const base: TemplateFormDraft = {
    templateCode: item.templateCode,
    name: item.name,
    phaseNumber: item.phaseNumber,
    outputType: item.outputType,
    required: item.required,
    schemaVersion: item.schemaVersion,
    sectionDefinitions: item.detail.sectionDefinitions,
    fieldDefinitions: item.detail.fieldDefinitions,
    validationRules: item.detail.validationRules,
    markdownRendererSettings: item.detail.markdownRendererSettings,
    jsonEvidenceSettings: item.detail.jsonEvidenceSettings,
    usageSummaryLabel: item.detail.usageSummaryLabel,
  };

  if (item.templateCode.trim().toUpperCase() !== "A-0") {
    return base;
  }

  return {
    ...base,
    sectionDefinitions: base.sectionDefinitions.trim() || A0_EXAMPLES.sectionDefinitions,
    fieldDefinitions: base.fieldDefinitions.trim() || A0_EXAMPLES.fieldDefinitions,
    validationRules: base.validationRules.trim() || A0_EXAMPLES.validationRules,
    markdownRendererSettings:
      base.markdownRendererSettings.trim() || A0_EXAMPLES.markdownRendererSettings,
    jsonEvidenceSettings: base.jsonEvidenceSettings.trim() || A0_EXAMPLES.jsonEvidenceSettings,
  };
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{children}</span>;
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        props.className,
      )}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "min-h-[88px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        props.className,
      )}
    />
  );
}

export function TemplateDefinitionFields({
  draft,
  onChange,
  phaseOptions,
  disableTemplateCode,
}: {
  draft: TemplateFormDraft;
  onChange: (next: TemplateFormDraft) => void;
  phaseOptions: { phaseNumber: number; label: string }[];
  disableTemplateCode?: boolean;
}) {
  const set = (patch: Partial<TemplateFormDraft>) => onChange({ ...draft, ...patch });
  const isA0 = draft.templateCode.trim().toUpperCase() === "A-0";

  const sectionDefinitionsPlaceholder = isA0
    ? [
        "If this box is empty: list your form steps in order (see prefilled A-0 text when you open this template).",
        "",
        A0_EXAMPLES.sectionDefinitions,
      ].join("\n")
    : [
        "WHAT TO DO: List every section/step of this template in order (1, 2, 3…).",
        "Each line is one step title people will see in the wizard.",
        "",
        "Example:",
        "1. Background",
        "2. Goals",
        "3. Risks",
        "4. Decision",
      ].join("\n");

  const fieldDefinitionsPlaceholder = isA0
    ? [
        "If this box is empty: describe each field (name, type, required, allowed values). See prefilled A-0.",
        "",
        A0_EXAMPLES.fieldDefinitions,
      ].join("\n")
    : [
        "WHAT TO DO: List each form field on its own line using this pattern:",
        "fieldName: text|textarea|number|date|select|checkbox, required|optional, rules…",
        "",
        "Example:",
        "summary: textarea, required, min=20",
        "goLiveDate: date, required, format=YYYY-MM-DD",
        "priority: select[Low|Medium|High], required",
      ].join("\n");

  const validationRulesPlaceholder = isA0
    ? [
        "If this box is empty: add bullets for “done enough” checks. See prefilled A-0.",
        "",
        A0_EXAMPLES.validationRules,
      ].join("\n")
    : [
        "WHAT TO DO: Write simple pass/fail rules for reviewers (plain bullets).",
        "",
        "Example:",
        "- Every required field has an answer",
        "- Dates use YYYY-MM-DD",
        "- If “Budget” is Yes, “Budget amount” must be filled",
      ].join("\n");

  const markdownRendererSettingsPlaceholder = isA0
    ? [
        "If this box is empty: describe how to turn answers into Markdown. See prefilled A-0.",
        "",
        A0_EXAMPLES.markdownRendererSettings,
      ].join("\n")
    : [
        "WHAT TO DO: Explain how this template’s answers should render as Markdown.",
        "",
        "Example:",
        "- Use ## for each section title",
        "- Skip sections with no answers",
        "- Put signatures/reviewer block at the bottom",
      ].join("\n");

  const jsonEvidenceSettingsPlaceholder = isA0
    ? [
        "If this box is empty: JSON-shaped notes for exports/automation. See prefilled A-0.",
        "",
        A0_EXAMPLES.jsonEvidenceSettings,
      ].join("\n")
    : [
        "WHAT TO DO: Optional JSON for tooling (which fields are required, enums, gate checks).",
        "Leave blank if you do not need JSON export metadata.",
        "",
        "Example:",
        '{ "requiredFields": ["summary"], "enumFields": ["priority"] }',
      ].join("\n");

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <FieldLabel>Template ID</FieldLabel>
          <TextInput
            value={draft.templateCode}
            disabled={disableTemplateCode}
            onChange={(e) => set({ templateCode: e.target.value })}
            placeholder="Official template id (used in URLs), e.g. A-0 or A-3.2"
            autoComplete="off"
          />
        </label>
        <label className="block text-sm">
          <FieldLabel>Template name</FieldLabel>
          <TextInput
            value={draft.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="Name shown in lists, e.g. Idea Capture Form"
          />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <FieldLabel>Related phase</FieldLabel>
          <select
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            value={draft.phaseNumber}
            onChange={(e) => set({ phaseNumber: Number(e.target.value) })}
          >
            {phaseOptions.map((p) => (
              <option key={p.phaseNumber} value={p.phaseNumber}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <FieldLabel>Output type</FieldLabel>
          <select
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
            value={draft.outputType}
            onChange={(e) => set({ outputType: e.target.value as TemplateFormDraft["outputType"] })}
          >
            <option value="markdown">Markdown</option>
            <option value="json">JSON</option>
            <option value="both">Both</option>
          </select>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-800">
          <input type="checkbox" checked={draft.required} onChange={(e) => set({ required: e.target.checked })} />
          Required template
        </label>
        <label className="block text-sm">
          <FieldLabel>Schema version</FieldLabel>
          <TextInput
            value={draft.schemaVersion}
            onChange={(e) => set({ schemaVersion: e.target.value })}
            placeholder="Version label for history, e.g. v1.0.0"
          />
        </label>
      </div>
      <label className="block text-sm">
        <FieldLabel>Section definitions</FieldLabel>
        <TextArea
          value={draft.sectionDefinitions}
          onChange={(e) => set({ sectionDefinitions: e.target.value })}
          placeholder={sectionDefinitionsPlaceholder}
        />
      </label>
      <label className="block text-sm">
        <FieldLabel>Field definitions</FieldLabel>
        <TextArea
          value={draft.fieldDefinitions}
          onChange={(e) => set({ fieldDefinitions: e.target.value })}
          placeholder={fieldDefinitionsPlaceholder}
        />
      </label>
      <label className="block text-sm">
        <FieldLabel>Validation rules</FieldLabel>
        <TextArea
          value={draft.validationRules}
          onChange={(e) => set({ validationRules: e.target.value })}
          placeholder={validationRulesPlaceholder}
        />
      </label>
      <label className="block text-sm">
        <FieldLabel>Markdown renderer settings</FieldLabel>
        <TextArea
          value={draft.markdownRendererSettings}
          onChange={(e) => set({ markdownRendererSettings: e.target.value })}
          placeholder={markdownRendererSettingsPlaceholder}
        />
      </label>
      <label className="block text-sm">
        <FieldLabel>JSON evidence settings</FieldLabel>
        <TextArea
          value={draft.jsonEvidenceSettings}
          onChange={(e) => set({ jsonEvidenceSettings: e.target.value })}
          placeholder={jsonEvidenceSettingsPlaceholder}
        />
      </label>
      <label className="block text-sm">
        <FieldLabel>Usage summary label</FieldLabel>
        <TextInput
          value={draft.usageSummaryLabel}
          onChange={(e) => set({ usageSummaryLabel: e.target.value })}
          placeholder="Short label for dashboards (optional), e.g. Phase 1 — idea intake"
        />
      </label>
    </div>
  );
}
