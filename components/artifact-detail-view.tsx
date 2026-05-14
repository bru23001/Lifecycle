"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import JSZip from "jszip";
import { Copy, Download, FileJson, FileText, History } from "lucide-react";

import { Button } from "@/components/ui/button";

export type ArtifactHistoryRow = {
  id: string;
  version: number;
  localId: string;
  status: string;
  createdAt: string;
};

type ArtifactDetailViewProps = {
  projectId: string;
  projectName: string;
  artifact: {
    id: string;
    templateId: string;
    localId: string;
    version: number;
    status: string;
    markdownPath: string;
    createdAt: string;
    updatedAt: string;
  };
  templateTitle: string;
  markdown: string;
  dataJson: Record<string, unknown>;
  history: ArtifactHistoryRow[];
};

type TabId = "markdown" | "json" | "history";

export function ArtifactDetailView({
  projectId,
  projectName,
  artifact,
  templateTitle,
  markdown,
  dataJson,
  history,
}: ArtifactDetailViewProps) {
  const [tab, setTab] = useState<TabId>("markdown");
  const [copied, setCopied] = useState<string | null>(null);

  const jsonPretty = useMemo(
    () => JSON.stringify(dataJson, null, 2),
    [dataJson],
  );

  const flash = (key: string) => {
    setCopied(key);
    window.setTimeout(() => setCopied(null), 2000);
  };

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(markdown);
    flash("md");
  };

  const copyJson = async () => {
    await navigator.clipboard.writeText(jsonPretty);
    flash("json");
  };

  const exportPackage = async () => {
    const zip = new JSZip();
    zip.file(
      `${artifact.templateId}_${artifact.localId}-v${artifact.version}.md`,
      markdown,
    );
    zip.file(
      `${artifact.templateId}_${artifact.localId}-v${artifact.version}.json`,
      jsonPretty,
    );
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${artifact.templateId}_${artifact.localId}-export.zip`;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const tabBtn = (id: TabId, label: string, icon: ReactNode) => (
    <button
      key={id}
      type="button"
      data-testid={`artifact-detail-tab-${id}`}
      onClick={() => setTab(id)}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        tab === id
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="text-muted-foreground">
          <Link href={`/projects/${projectId}`} className="underline-offset-4 hover:underline">
            {projectName}
          </Link>
          <span aria-hidden className="px-1">
            /
          </span>
          <span className="text-foreground">Artifact</span>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => void exportPackage()} data-testid="artifact-export-package">
          <Download className="size-3.5" aria-hidden />
          Export package
        </Button>
      </div>

      <header className="mb-8 border-b pb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {artifact.templateId}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{templateTitle}</h1>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Status</dt>
            <dd className="font-medium">{artifact.status}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Version</dt>
            <dd className="font-medium">v{artifact.version}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Local ID</dt>
            <dd className="font-mono text-xs">{artifact.localId}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Vault path</dt>
            <dd className="break-all font-mono text-xs">{artifact.markdownPath}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Created</dt>
            <dd>{new Date(artifact.createdAt).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Updated</dt>
            <dd>{new Date(artifact.updatedAt).toLocaleString()}</dd>
          </div>
        </dl>
      </header>

      <div className="mb-4 flex flex-wrap gap-2 border-b pb-3">
        {tabBtn("markdown", "Markdown", <FileText className="size-3.5" aria-hidden />)}
        {tabBtn("json", "JSON evidence", <FileJson className="size-3.5" aria-hidden />)}
        {tabBtn("history", "Version history", <History className="size-3.5" aria-hidden />)}
      </div>

      {copied ? (
        <p role="status" className="mb-3 text-sm text-muted-foreground" data-testid="artifact-detail-copy-toast">
          Copied {copied === "md" ? "Markdown" : "JSON"} to clipboard
        </p>
      ) : null}

      {tab === "markdown" ? (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => void copyMarkdown()} data-testid="artifact-copy-markdown">
              <Copy className="size-3.5" aria-hidden />
              Copy Markdown
            </Button>
          </div>
          <pre className="max-h-[min(70vh,640px)] overflow-auto rounded-xl border bg-muted/20 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
            {markdown}
          </pre>
        </div>
      ) : null}

      {tab === "json" ? (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Button type="button" variant="outline" size="sm" onClick={() => void copyJson()} data-testid="artifact-copy-json">
              <Copy className="size-3.5" aria-hidden />
              Copy JSON
            </Button>
          </div>
          <pre className="max-h-[min(70vh,640px)] overflow-auto rounded-xl border bg-muted/20 p-4 font-mono text-xs leading-relaxed">
            {jsonPretty}
          </pre>
        </div>
      ) : null}

      {tab === "history" ? (
        <div className="rounded-xl border">
          {history.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No related artifacts for this template.</p>
          ) : (
            <ul className="divide-y">
              {history.map((row) => (
                <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                  <div>
                    <span className="font-mono text-xs text-muted-foreground">{row.localId}</span>
                    <span className="mx-2 text-muted-foreground">·</span>
                    <span>v{row.version}</span>
                    <span className="mx-2 text-muted-foreground">·</span>
                    <span>{row.status}</span>
                    <span className="mx-2 text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(row.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {row.id === artifact.id ? (
                    <span className="text-xs font-medium text-primary">Current</span>
                  ) : (
                    <Link
                      href={`/projects/${projectId}/artifacts/${row.id}`}
                      className="text-xs font-medium text-primary underline-offset-2 hover:underline"
                    >
                      Open
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
