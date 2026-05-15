"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  TemplateRegistryPageShell,
  TemplateSettingsDialog,
} from "@/components/settings/template-registry-shared";
import type { SettingsPageData, TemplateRegistryItem, TemplateVersionEntry } from "@/types/settings.types";

function PreviewBlock({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words text-xs text-slate-800">
        {body.trim().length > 0 ? body : "—"}
      </pre>
    </section>
  );
}

export function TemplateDetailPageClient({
  initial,
  item,
}: {
  initial: SettingsPageData;
  item: TemplateRegistryItem;
}) {
  const router = useRouter();
  const [historyOpen, setHistoryOpen] = useState(false);

  const { detail } = item;

  return (
    <TemplateRegistryPageShell
      navActive="template_registry"
      user={initial.user}
      breadcrumbs={[
        { label: "Home", href: "/" },
        { label: "Settings", href: "/settings/lifecycle" },
        { label: "Template Registry", href: "/settings/templates" },
        { label: item.templateCode },
      ]}
    >
      <div className="mt-6 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{item.name}</h1>
            <p className="mt-1 text-sm text-slate-600">
              <span className="font-mono text-slate-800">{item.templateCode}</span>
              <span className="mx-2 text-slate-300">·</span>
              Phase {item.phaseNumber} ({item.phaseName})
              <span className="mx-2 text-slate-300">·</span>
              {item.outputType}
              <span className="mx-2 text-slate-300">·</span>
              {item.required ? "Required" : "Optional"}
              <span className="mx-2 text-slate-300">·</span>
              {item.schemaVersion}
              <span className="mx-2 text-slate-300">·</span>
              {item.status}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/settings/templates/${encodeURIComponent(item.id)}/edit`}
              className={cn(buttonVariants({ variant: "default", size: "sm" }))}
            >
              Edit template
            </Link>
            <Button type="button" size="sm" variant="outline" onClick={() => setHistoryOpen(true)}>
              Version history
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => router.push("/settings/templates")}>
              Back to registry
            </Button>
          </div>
        </div>

        {detail.usageSummaryLabel.trim().length > 0 ? (
          <p className="rounded-lg border border-slate-100 bg-white px-4 py-3 text-sm text-slate-700">
            <span className="font-semibold text-slate-900">Usage summary: </span>
            {detail.usageSummaryLabel}
          </p>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-2">
          <PreviewBlock title="Section definitions" body={detail.sectionDefinitions} />
          <PreviewBlock title="Field schema" body={detail.fieldDefinitions} />
          <PreviewBlock title="Validation rules" body={detail.validationRules} />
          <PreviewBlock title="Markdown renderer settings" body={detail.markdownRendererSettings} />
          <PreviewBlock title="JSON evidence settings" body={detail.jsonEvidenceSettings} />
        </div>
      </div>

      <TemplateSettingsDialog
        open={historyOpen}
        title="Version history"
        wide
        onClose={() => setHistoryOpen(false)}
        footer={
          <Button type="button" variant="outline" onClick={() => setHistoryOpen(false)}>
            Close
          </Button>
        }
      >
        {detail.versionHistory.length === 0 ? (
          <p className="text-sm text-slate-600">No recorded versions yet.</p>
        ) : (
          <ul className="space-y-3">
            {detail.versionHistory.map((v: TemplateVersionEntry) => (
              <li key={v.id} className="rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-sm">
                <div className="flex flex-wrap justify-between gap-2 font-semibold text-slate-900">
                  <span>{v.changeSummary}</span>
                  <span className="text-xs font-normal text-slate-500">{v.timestampLabel}</span>
                </div>
                <div className="mt-1 text-xs text-slate-600">
                  {v.author} · schema {v.schemaSnapshot}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" disabled title="Not available in this build">
                    Compare
                  </Button>
                  <Button type="button" size="sm" variant="outline" disabled title="Not available in this build">
                    Restore
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </TemplateSettingsDialog>
    </TemplateRegistryPageShell>
  );
}
