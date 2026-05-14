"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";

import { createTraceLink } from "@/app/actions/createTraceLink";
import { Button } from "@/components/ui/button";
import {
  RELATION_HELP,
  TRACE_LINK_CONFIDENCE,
  TRACE_LINK_RELATIONS,
  type TraceLinkConfidence,
  type TraceLinkRelation,
} from "@/lib/trace-link-relations";
import type {
  CreateLinkPrefill,
  CreateLinkPrefillKind,
} from "@/lib/traceability-gap-details";
import { toUserMessage } from "@/lib/toUserMessage";
import { cn } from "@/lib/utils";
import type { TraceableEndpoint, TraceableEndpoints } from "@/types/traceability.types";

const kindOptions: { value: CreateLinkPrefillKind; label: string }[] = [
  { value: "requirement", label: "Requirement" },
  { value: "feature", label: "Feature" },
  { value: "artifact", label: "Artifact" },
];

type Props = {
  open: boolean;
  projectId: string;
  endpoints: TraceableEndpoints;
  prefill: CreateLinkPrefill | null;
  onClose: () => void;
};

/**
 * Create Trace Link Modal (`projects-list-new-screens.md` §7).
 *
 * Lets the user create a manual `TraceLink` between two project-local objects.
 * Server-side validation + tenant isolation live in `createTraceLink` — this
 * component's client-side validation is UX-only.
 *
 * Prefill (`CreateLinkPrefill`) is best-effort; the user can override every
 * field. Prefill ids may be either internal db ids OR project-local codes
 * (e.g. `CRS-001`) since the gap drawer doesn't always know the underlying id;
 * we resolve them against `endpoints` and only apply a match if found.
 */
export function CreateTraceLinkModal({ open, projectId, endpoints, prefill, onClose }: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [fromKind, setFromKind] = useState<CreateLinkPrefillKind>("requirement");
  const [fromId, setFromId] = useState<string>("");
  const [toKind, setToKind] = useState<CreateLinkPrefillKind>("feature");
  const [toId, setToId] = useState<string>("");
  const [relation, setRelation] = useState<TraceLinkRelation>("derives");
  const [confidence, setConfidence] = useState<TraceLinkConfidence>("medium");
  const [evidenceReference, setEvidenceReference] = useState("");
  const [rationale, setRationale] = useState<string>("");

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // Reset on every fresh open and apply the prefill if one was supplied.
    setError(null);
    const initial = applyPrefill(prefill, endpoints);
    setFromKind(initial.fromKind);
    setFromId(initial.fromId);
    setToKind(initial.toKind);
    setToId(initial.toId);
    setRelation(initial.relation);
    setConfidence("medium");
    setEvidenceReference("");
    setRationale("");
  }, [open, prefill, endpoints]);

  const fromOptions = endpointsByKind(endpoints, fromKind);
  const toOptions = endpointsByKind(endpoints, toKind);

  const sameRefSelected = useMemo(
    () => fromKind === toKind && fromId !== "" && fromId === toId,
    [fromKind, toKind, fromId, toId],
  );

  const formValid =
    fromKind && fromId && toKind && toId && !sameRefSelected && rationale.trim().length >= 3;

  function handleSubmit() {
    if (!formValid || pending) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await createTraceLink({
          projectId,
          fromKind,
          fromId,
          toKind,
          toId,
          relation,
          rationale: rationale.trim(),
          confidence,
          evidenceReference: evidenceReference.trim(),
        });
        if (!res.ok) {
          setError(toUserMessage(res.error));
          return;
        }
        onClose();
        router.refresh();
      } catch (e) {
        setError(toUserMessage(e));
      }
    });
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed left-1/2 top-1/2 z-50 w-[min(100vw-2rem,640px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="create-trace-link-modal-title"
    >
      <div className="flex max-h-[85vh] flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-6 py-4 dark:border-border">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Traceability
            </p>
            <h2
              id="create-trace-link-modal-title"
              className="mt-1 text-lg font-semibold text-slate-900 dark:text-foreground"
            >
              Create trace link
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Connect two project objects so downstream coverage updates automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-muted"
          >
            <X className="size-4" aria-hidden />
          </button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 py-5 text-sm">
          <Row label="Source">
            <KindAndObject
              kind={fromKind}
              onKindChange={(k) => {
                setFromKind(k);
                setFromId("");
              }}
              objectId={fromId}
              onObjectIdChange={setFromId}
              options={fromOptions}
              kindAriaLabel="Source type"
              objectAriaLabel="Source object"
            />
          </Row>

          <Row label="Target">
            <KindAndObject
              kind={toKind}
              onKindChange={(k) => {
                setToKind(k);
                setToId("");
              }}
              objectId={toId}
              onObjectIdChange={setToId}
              options={toOptions}
              kindAriaLabel="Target type"
              objectAriaLabel="Target object"
            />
            {sameRefSelected ? (
              <p className="mt-1 text-xs text-red-700">Source and target must be different.</p>
            ) : null}
          </Row>

          <Row label="Link type">
            <select
              value={relation}
              onChange={(e) => setRelation(e.target.value as TraceLinkRelation)}
              className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-input dark:bg-input/30 dark:text-foreground"
              aria-label="Link type"
            >
              {TRACE_LINK_RELATIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">{RELATION_HELP[relation]}</p>
          </Row>

          <Row label="Confidence">
            <select
              value={confidence}
              onChange={(e) => setConfidence(e.target.value as TraceLinkConfidence)}
              className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-input dark:bg-input/30 dark:text-foreground"
              aria-label="Confidence"
            >
              {TRACE_LINK_CONFIDENCE.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">How strong is the supporting evidence for this link?</p>
          </Row>

          <Row label="Evidence reference">
            <input
              type="text"
              value={evidenceReference}
              onChange={(e) => setEvidenceReference(e.target.value)}
              maxLength={500}
              aria-label="Evidence reference"
              placeholder="Ticket id, document pointer, or artifact (optional)"
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-input dark:bg-input/30 dark:text-foreground"
            />
          </Row>

          <Row label="Rationale">
            <textarea
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              maxLength={500}
              rows={3}
              required
              aria-label="Rationale"
              placeholder="Why does this link exist? (3–500 characters)"
              className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 dark:border-input dark:bg-input/30 dark:text-foreground"
            />
            <p className="mt-1 text-xs text-slate-500">
              Captured in the audit trail; never written to application logs.
            </p>
          </Row>

          {error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          ) : null}
        </div>

        <footer
          className={cn(
            "flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 px-6 py-3 dark:border-border",
          )}
        >
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            type="button"
            className="gap-2"
            onClick={handleSubmit}
            disabled={!formValid || pending}
          >
            <Plus className="size-4" aria-hidden />
            {pending ? "Saving…" : "Save link"}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function KindAndObject({
  kind,
  onKindChange,
  objectId,
  onObjectIdChange,
  options,
  kindAriaLabel,
  objectAriaLabel,
}: {
  kind: CreateLinkPrefillKind;
  onKindChange: (k: CreateLinkPrefillKind) => void;
  objectId: string;
  onObjectIdChange: (id: string) => void;
  options: TraceableEndpoint[];
  kindAriaLabel: string;
  objectAriaLabel: string;
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <select
        value={kind}
        onChange={(e) => onKindChange(e.target.value as CreateLinkPrefillKind)}
        aria-label={kindAriaLabel}
        className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 sm:w-44"
      >
        {kindOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <select
        value={objectId}
        onChange={(e) => onObjectIdChange(e.target.value)}
        aria-label={objectAriaLabel}
        className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900"
      >
        <option value="" disabled>
          {options.length === 0
            ? "No objects available"
            : `Select a ${kind}…`}
        </option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function endpointsByKind(endpoints: TraceableEndpoints, kind: CreateLinkPrefillKind): TraceableEndpoint[] {
  switch (kind) {
    case "requirement":
      return endpoints.requirements;
    case "feature":
      return endpoints.features;
    case "artifact":
      return endpoints.artifacts;
    default: {
      const _exhaustive: never = kind;
      void _exhaustive;
      return [];
    }
  }
}

function applyPrefill(
  prefill: CreateLinkPrefill | null,
  endpoints: TraceableEndpoints,
): {
  fromKind: CreateLinkPrefillKind;
  fromId: string;
  toKind: CreateLinkPrefillKind;
  toId: string;
  relation: TraceLinkRelation;
} {
  const fromKind: CreateLinkPrefillKind = prefill?.fromKind ?? "requirement";
  const toKind: CreateLinkPrefillKind = prefill?.toKind ?? defaultTargetKindFor(fromKind);
  return {
    fromKind,
    fromId: resolveId(prefill?.fromId, endpointsByKind(endpoints, fromKind)),
    toKind,
    toId: resolveId(prefill?.toId, endpointsByKind(endpoints, toKind)),
    relation: prefill?.relationHint ?? defaultRelationFor(fromKind, toKind),
  };
}

function resolveId(candidate: string | undefined, options: TraceableEndpoint[]): string {
  if (!candidate) return "";
  if (options.some((o) => o.id === candidate)) return candidate;
  // Fall back to localId matching (the gap drawer often passes a localId like
  // `CRS-001` since gap rows don't carry internal ids).
  const byLocal = options.find((o) => o.localId === candidate);
  return byLocal?.id ?? "";
}

function defaultTargetKindFor(fromKind: CreateLinkPrefillKind): CreateLinkPrefillKind {
  if (fromKind === "requirement") return "feature";
  if (fromKind === "feature") return "requirement";
  return "requirement";
}

function defaultRelationFor(
  fromKind: CreateLinkPrefillKind,
  toKind: CreateLinkPrefillKind,
): TraceLinkRelation {
  if (fromKind === "requirement" && toKind === "feature") return "implements";
  if (fromKind === "feature" && toKind === "requirement") return "derives";
  if (toKind === "artifact") return "tests";
  return "informs";
}
