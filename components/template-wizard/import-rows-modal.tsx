"use client";

import { useEffect, useMemo, useState } from "react";
import { Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WizardScoreMatrix } from "@/types/template-wizard.types";

export type ImportRowDraft = {
  sourceRowIndex: number;
  name: string;
  description: string;
  weight: number;
  scores: Record<string, number | undefined>;
  comment: string;
  evidence: string[];
  issues: { tone: "warn" | "error"; message: string }[];
};

type Step = "upload" | "mapping" | "preview" | "summary";

const RESERVED_FIELDS = ["name", "description", "weight", "comment", "evidence"] as const;
type ReservedField = (typeof RESERVED_FIELDS)[number];

export function ImportRowsModal({
  open,
  matrix,
  onClose,
  onImport,
}: {
  open: boolean;
  matrix: WizardScoreMatrix;
  onClose: () => void;
  onImport: (rows: ImportRowDraft[]) => void;
}) {
  const [step, setStep] = useState<Step>("upload");
  const [format, setFormat] = useState<"csv" | "json">("csv");
  const [rawText, setRawText] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [sourceColumns, setSourceColumns] = useState<string[]>([]);
  const [sourceRows, setSourceRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setStep("upload");
    setFormat("csv");
    setRawText("");
    setParseError(null);
    setSourceColumns([]);
    setSourceRows([]);
    setMapping({});
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function parseInput() {
    try {
      if (format === "csv") {
        const parsed = parseCsv(rawText);
        if (parsed.rows.length === 0) {
          setParseError("No data rows detected.");
          return;
        }
        setSourceColumns(parsed.columns);
        setSourceRows(parsed.rows);
        setMapping(buildDefaultMapping(parsed.columns, matrix.optionKeys));
        setParseError(null);
        setStep("mapping");
      } else {
        const parsed = JSON.parse(rawText);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          setParseError("Expected a non-empty JSON array of row objects.");
          return;
        }
        const cols = Array.from(
          new Set(parsed.flatMap((r) => (r && typeof r === "object" ? Object.keys(r) : []))),
        );
        const rows = parsed.map((r) => {
          const obj: Record<string, string> = {};
          if (r && typeof r === "object") {
            for (const [k, v] of Object.entries(r)) {
              obj[k] = v == null ? "" : String(v);
            }
          }
          return obj;
        });
        setSourceColumns(cols);
        setSourceRows(rows);
        setMapping(buildDefaultMapping(cols, matrix.optionKeys));
        setParseError(null);
        setStep("mapping");
      }
    } catch (e) {
      setParseError(e instanceof Error ? e.message : String(e));
    }
  }

  const drafts = useMemo<ImportRowDraft[]>(() => {
    if (step !== "preview" && step !== "summary") return [];
    return sourceRows.map((row, index) => buildDraft(row, mapping, matrix, index));
  }, [step, sourceRows, mapping, matrix]);

  const summary = useMemo(() => {
    const importable = drafts.filter((d) => d.issues.every((i) => i.tone !== "error"));
    const rejected = drafts.length - importable.length;
    return { total: drafts.length, importable: importable.length, rejected, importableDrafts: importable };
  }, [drafts]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
      role="presentation"
    >
      <div
        className="flex max-h-[min(820px,100vh-2rem)] w-full max-w-3xl flex-col rounded-2xl border border-border bg-card shadow-xl"
        data-testid="import-rows-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-rows-title"
      >
        <header className="flex items-start justify-between gap-3 border-b px-5 py-4">
          <div>
            <h2 id="import-rows-title" className="text-lg font-semibold text-foreground">
              Import rows
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Step {stepNumber(step)} of 4 · {stepLabel(step)}
            </p>
          </div>
          <button
            type="button"
            className="rounded-md p-2 text-muted-foreground hover:bg-muted"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {step === "upload" ? (
            <UploadStep
              format={format}
              setFormat={setFormat}
              rawText={rawText}
              setRawText={setRawText}
              parseError={parseError}
              onParse={parseInput}
            />
          ) : null}

          {step === "mapping" ? (
            <MappingStep
              sourceColumns={sourceColumns}
              mapping={mapping}
              setMapping={setMapping}
              matrix={matrix}
              sourcePreview={sourceRows[0] ?? {}}
            />
          ) : null}

          {step === "preview" ? <PreviewStep drafts={drafts} matrix={matrix} /> : null}

          {step === "summary" ? (
            <SummaryStep total={summary.total} importable={summary.importable} rejected={summary.rejected} />
          ) : null}
        </div>

        <footer className="flex flex-wrap justify-between gap-2 border-t px-5 py-4">
          <div className="flex gap-2">
            {step !== "upload" ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (step === "mapping") setStep("upload");
                  else if (step === "preview") setStep("mapping");
                  else if (step === "summary") setStep("preview");
                }}
              >
                Back
              </Button>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {step === "upload" ? (
              <Button type="button" onClick={parseInput} disabled={rawText.trim() === ""}>
                Parse
              </Button>
            ) : null}
            {step === "mapping" ? (
              <Button type="button" onClick={() => setStep("preview")}>
                Preview
              </Button>
            ) : null}
            {step === "preview" ? (
              <Button type="button" onClick={() => setStep("summary")}>
                Review summary
              </Button>
            ) : null}
            {step === "summary" ? (
              <Button
                type="button"
                data-testid="import-rows-confirm"
                disabled={summary.importable === 0}
                onClick={() => {
                  onImport(summary.importableDrafts);
                }}
              >
                Import {summary.importable} row{summary.importable === 1 ? "" : "s"}
              </Button>
            ) : null}
          </div>
        </footer>
      </div>
    </div>
  );
}

function stepNumber(s: Step): number {
  return s === "upload" ? 1 : s === "mapping" ? 2 : s === "preview" ? 3 : 4;
}
function stepLabel(s: Step): string {
  return s === "upload"
    ? "Upload CSV / JSON"
    : s === "mapping"
      ? "Field mapping"
      : s === "preview"
        ? "Validation preview"
        : "Import summary";
}

function UploadStep({
  format,
  setFormat,
  rawText,
  setRawText,
  parseError,
  onParse,
}: {
  format: "csv" | "json";
  setFormat: (f: "csv" | "json") => void;
  rawText: string;
  setRawText: (s: string) => void;
  parseError: string | null;
  onParse: () => void;
}) {
  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.name.toLowerCase().endsWith(".json")) setFormat("json");
    else setFormat("csv");
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      if (typeof text === "string") setRawText(text);
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-3 text-sm">
      <div className="flex gap-3">
        {(["csv", "json"] as const).map((f) => (
          <label key={f} className="inline-flex items-center gap-1.5">
            <input
              type="radio"
              name="import-format"
              checked={format === f}
              onChange={() => setFormat(f)}
            />
            <span className="uppercase">{f}</span>
          </label>
        ))}
      </div>
      <label className="block">
        <span className="text-xs font-medium text-muted-foreground">Upload file</span>
        <input
          type="file"
          accept=".csv,.json,text/csv,application/json"
          onChange={onFile}
          className="mt-1 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:text-foreground"
        />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-muted-foreground">Or paste raw content</span>
        <textarea
          rows={8}
          className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 font-mono text-xs"
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder={
            format === "csv"
              ? "name,weight,opt-a,opt-b,comment\nFunctional Fit,30,5,4,Strong SAML/OIDC coverage."
              : "[{ \"name\": \"Functional Fit\", \"weight\": 30, \"opt-a\": 5 }]"
          }
        />
      </label>
      {parseError ? (
        <p className="rounded-md border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-xs text-[#991b1b]">
          {parseError}
        </p>
      ) : null}
      <Button type="button" variant="outline" size="sm" onClick={onParse} disabled={rawText.trim() === ""}>
        <Upload className="size-3.5" /> Parse content
      </Button>
    </div>
  );
}

function MappingStep({
  sourceColumns,
  mapping,
  setMapping,
  matrix,
  sourcePreview,
}: {
  sourceColumns: string[];
  mapping: Record<string, string>;
  setMapping: (m: Record<string, string>) => void;
  matrix: WizardScoreMatrix;
  sourcePreview: Record<string, string>;
}) {
  const targets: { value: string; label: string }[] = [
    { value: "", label: "— Ignore —" },
    { value: "name", label: "Name" },
    { value: "description", label: "Description" },
    { value: "weight", label: "Weight" },
    { value: "comment", label: "Comment" },
    { value: "evidence", label: "Evidence (semicolon-separated)" },
    ...matrix.optionKeys.map((ok) => ({
      value: `score:${ok}`,
      label: `Score · ${matrix.optionLabels[ok] ?? ok}`,
    })),
  ];

  return (
    <div className="space-y-3 text-sm">
      <p className="text-xs text-muted-foreground">
        Map source columns to matrix attributes. Required: <strong>name</strong> and <strong>weight</strong>.
      </p>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-left text-muted-foreground">
            <th className="px-3 py-2 font-medium">Source column</th>
            <th className="px-3 py-2 font-medium">Sample value</th>
            <th className="px-3 py-2 font-medium">Target</th>
          </tr>
        </thead>
        <tbody>
          {sourceColumns.map((col) => (
            <tr key={col} className="border-b last:border-b-0">
              <td className="px-3 py-2 font-medium text-foreground">{col}</td>
              <td className="px-3 py-2 text-xs text-muted-foreground">
                <code className="rounded bg-muted px-1.5 py-0.5">
                  {sourcePreview[col] ?? ""}
                </code>
              </td>
              <td className="px-3 py-2">
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                  value={mapping[col] ?? ""}
                  onChange={(e) => setMapping({ ...mapping, [col]: e.target.value })}
                >
                  {targets.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PreviewStep({
  drafts,
  matrix,
}: {
  drafts: ImportRowDraft[];
  matrix: WizardScoreMatrix;
}) {
  return (
    <div className="text-sm">
      <p className="text-xs text-muted-foreground">
        {drafts.length} row{drafts.length === 1 ? "" : "s"} parsed. Rows with errors are excluded from import.
      </p>
      <ul className="mt-3 space-y-2">
        {drafts.map((d) => {
          const hasError = d.issues.some((i) => i.tone === "error");
          return (
            <li
              key={d.sourceRowIndex}
              className={cn(
                "rounded-xl border px-3 py-2 text-sm",
                hasError ? "border-[#fecaca] bg-[#fef2f2]" : "border-border bg-background",
              )}
            >
              <p className="font-semibold">
                Row {d.sourceRowIndex + 1}: {d.name || "(no name)"}
              </p>
              <p className="text-xs text-muted-foreground">
                Weight {d.weight}% · scores{" "}
                {matrix.optionKeys.map((ok) => `${ok}:${d.scores[ok] ?? "—"}`).join(", ")}
              </p>
              {d.issues.length > 0 ? (
                <ul className="mt-1 space-y-0.5 text-xs">
                  {d.issues.map((issue, idx) => (
                    <li
                      key={idx}
                      className={issue.tone === "error" ? "text-[#b91c1c]" : "text-[#92400e]"}
                    >
                      {issue.message}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SummaryStep({
  total,
  importable,
  rejected,
}: {
  total: number;
  importable: number;
  rejected: number;
}) {
  return (
    <div className="space-y-3 text-sm">
      <div className="grid gap-2 sm:grid-cols-3">
        <SummaryStat label="Parsed" value={total} />
        <SummaryStat label="Importable" value={importable} tone="ok" />
        <SummaryStat label="Rejected" value={rejected} tone={rejected > 0 ? "warn" : "neutral"} />
      </div>
      <p className="text-xs text-muted-foreground">
        Confirming will append {importable} row{importable === 1 ? "" : "s"} to the matrix and leave
        rejected rows untouched. You can revisit the upload step to fix and re-import the rest.
      </p>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "ok" | "warn" | "neutral";
}) {
  const cls =
    tone === "ok"
      ? "border-[#86efac] bg-[#f0fdf4] text-[#166534]"
      : tone === "warn"
        ? "border-[#fde68a] bg-[#fffbeb] text-[#92400e]"
        : "border-border bg-muted/20 text-foreground";
  return (
    <div className={cn("rounded-xl border px-3 py-2", cls)}>
      <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
      <p className="mt-0.5 text-xl font-bold">{value}</p>
    </div>
  );
}

function buildDefaultMapping(columns: string[], optionKeys: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  for (const col of columns) {
    const norm = col.trim().toLowerCase();
    if ((RESERVED_FIELDS as readonly string[]).includes(norm)) {
      mapping[col] = norm;
      continue;
    }
    const optionMatch = optionKeys.find((ok) => ok.toLowerCase() === norm);
    if (optionMatch) {
      mapping[col] = `score:${optionMatch}`;
      continue;
    }
    mapping[col] = "";
  }
  return mapping;
}

function buildDraft(
  source: Record<string, string>,
  mapping: Record<string, string>,
  matrix: WizardScoreMatrix,
  sourceRowIndex: number,
): ImportRowDraft {
  const draft: ImportRowDraft = {
    sourceRowIndex,
    name: "",
    description: "",
    weight: 0,
    scores: {},
    comment: "",
    evidence: [],
    issues: [],
  };
  for (const ok of matrix.optionKeys) draft.scores[ok] = undefined;

  for (const [col, target] of Object.entries(mapping)) {
    if (!target) continue;
    const raw = source[col] ?? "";
    if ((RESERVED_FIELDS as readonly string[]).includes(target)) {
      const field = target as ReservedField;
      if (field === "name") draft.name = raw.trim();
      else if (field === "description") draft.description = raw.trim();
      else if (field === "comment") draft.comment = raw;
      else if (field === "weight") {
        const n = Number.parseInt(raw, 10);
        draft.weight = Number.isFinite(n) ? n : 0;
      } else if (field === "evidence") {
        draft.evidence = raw
          .split(/[,;\n]/)
          .map((s) => s.trim())
          .filter(Boolean);
      }
      continue;
    }
    if (target.startsWith("score:")) {
      const ok = target.slice("score:".length);
      const n = Number.parseInt(raw, 10);
      draft.scores[ok] = Number.isFinite(n) && n >= 1 && n <= 5 ? n : undefined;
    }
  }

  if (!draft.name) {
    draft.issues.push({ tone: "error", message: "Missing name." });
  }
  if (!Number.isFinite(draft.weight) || draft.weight <= 0) {
    draft.issues.push({ tone: "error", message: "Weight must be greater than 0." });
  }
  const missingScores = matrix.optionKeys.filter((ok) => typeof draft.scores[ok] !== "number");
  if (missingScores.length > 0) {
    draft.issues.push({
      tone: "warn",
      message: `${missingScores.length} option score${missingScores.length === 1 ? "" : "s"} missing or invalid.`,
    });
  }
  return draft;
}

function parseCsv(input: string): { columns: string[]; rows: Record<string, string>[] } {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length === 0) return { columns: [], rows: [] };
  const columns = splitCsvLine(lines[0]);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    const row: Record<string, string> = {};
    columns.forEach((col, idx) => {
      row[col] = (cells[idx] ?? "").trim();
    });
    rows.push(row);
  }
  return { columns, rows };
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else if (ch === '"') {
      inQuotes = true;
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((c) => c.trim());
}
