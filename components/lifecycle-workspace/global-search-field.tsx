"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

import type { GlobalSearchResponse, GlobalSearchResultItem } from "@/types/global-search.types";
import { cn } from "@/lib/utils";
import { useWorkspaceUnsavedGuardOptional } from "@/components/lifecycle-workspace/workspace-unsaved-context";

const TYPE_ORDER: GlobalSearchResultItem["type"][] = [
  "project",
  "workspace",
  "artifact",
  "evidence",
  "gate_decision",
  "approval",
  "template",
  "traceability",
  "reports",
];

function sortGlobalSearchResults(results: GlobalSearchResultItem[]): GlobalSearchResultItem[] {
  const rank = (t: GlobalSearchResultItem["type"]) => {
    const i = TYPE_ORDER.indexOf(t);
    return i < 0 ? 99 : i;
  };
  return [...results].sort((a, b) => rank(a.type) - rank(b.type) || a.title.localeCompare(b.title));
}

function typeLabel(type: GlobalSearchResultItem["type"]): string {
  switch (type) {
    case "project":
      return "Projects";
    case "workspace":
      return "Workspace";
    case "artifact":
      return "Artifacts";
    case "evidence":
      return "Evidence";
    case "approval":
      return "Approvals";
    case "gate_decision":
      return "Gates";
    case "template":
      return "Templates";
    case "traceability":
      return "Traceability";
    case "reports":
      return "Reports";
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

function SearchResultsList({
  query,
  loading,
  orderedResults,
  activeIndex,
  setActiveIndex,
  onPick,
  listboxId,
}: {
  query: string;
  loading: boolean;
  orderedResults: GlobalSearchResultItem[];
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  onPick: (href: string) => void;
  listboxId: string;
}) {
  if (query.trim().length < 2 && !loading) {
    return <p className="px-3 py-2 text-xs text-muted-foreground">Type at least 2 characters.</p>;
  }
  if (loading) {
    return <p className="px-3 py-2 text-xs text-muted-foreground">Searching…</p>;
  }
  if (orderedResults.length === 0) {
    return <p className="px-3 py-2 text-xs text-muted-foreground">No matches.</p>;
  }

  return (
    <ul className="py-1" id={listboxId} role="listbox">
      {orderedResults.map((item, index) => {
        const showHeading = index === 0 || orderedResults[index - 1]!.type !== item.type;
        return (
          <Fragment key={item.id}>
            {showHeading ? (
              <li role="presentation" className="px-3 pb-1 pt-2">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                  {typeLabel(item.type)}
                </p>
              </li>
            ) : null}
            <li role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                className={cn(
                  "flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm transition hover:bg-muted/80",
                  index === activeIndex && "bg-muted",
                )}
                onMouseEnter={() => setActiveIndex(index)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onPick(item.href)}
              >
                <span className="font-medium text-foreground">{item.title}</span>
                <span className="text-xs text-muted-foreground">{item.subtitle}</span>
              </button>
            </li>
          </Fragment>
        );
      })}
    </ul>
  );
}

export function GlobalSearchField({ className }: { className?: string }) {
  const router = useRouter();
  const unsavedGuard = useWorkspaceUnsavedGuardOptional();
  const [query, setQuery] = useState("");
  const [inlineOpen, setInlineOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<GlobalSearchResultItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inlineInputRef = useRef<HTMLInputElement>(null);
  const paletteInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const orderedResults = useMemo(() => sortGlobalSearchResults(results), [results]);

  const runSearch = useCallback(async (q: string) => {
    abortRef.current?.abort();
    if (q.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`, {
        signal: ac.signal,
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        setResults([]);
        return;
      }
      const data = (await res.json()) as GlobalSearchResponse;
      setResults(data.results);
      setActiveIndex(0);
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setResults([]);
    } finally {
      if (!ac.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void runSearch(query);
    }, 280);
    return () => window.clearTimeout(t);
  }, [query, runSearch]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setInlineOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (paletteOpen) {
      if (!node.open) node.showModal();
      window.setTimeout(() => paletteInputRef.current?.focus(), 0);
    } else if (node.open) {
      node.close();
    }
  }, [paletteOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const editable =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        target?.isContentEditable ||
        Boolean(target?.closest("dialog"));
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
        return;
      }
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey && !editable) {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    const navigate = () => {
      setInlineOpen(false);
      setPaletteOpen(false);
      setQuery("");
      setResults([]);
      router.push(href);
    };
    if (unsavedGuard) {
      unsavedGuard.guardNavigation(navigate);
    } else {
      navigate();
    }
  };

  useEffect(() => {
    const sorted = sortGlobalSearchResults(results);
    setActiveIndex((i) => {
      if (sorted.length === 0) return 0;
      return Math.min(i, sorted.length - 1);
    });
  }, [results]);

  const handleListKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    opts: { allowArrowNavigation: boolean },
  ) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setInlineOpen(false);
      setPaletteOpen(false);
      return;
    }
    if (!opts.allowArrowNavigation || orderedResults.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(orderedResults.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = orderedResults[activeIndex];
      if (hit) go(hit.href);
    }
  };

  const showInlinePanel = inlineOpen && (query.trim().length >= 2 || loading);
  const paletteHasList = paletteOpen && (query.trim().length >= 2 || loading);

  const inputClass =
    "h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <>
      <button
        type="button"
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground outline-none ring-offset-background hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
        aria-label="Open global search"
        data-testid="global-search-open-mobile"
        onClick={() => setPaletteOpen(true)}
      >
        <Search className="size-4" aria-hidden />
      </button>

      <div ref={wrapRef} className={cn("relative hidden w-[330px] shrink-0 lg:block", className)}>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inlineInputRef}
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setInlineOpen(true);
          }}
          onFocus={() => setInlineOpen(true)}
          onKeyDown={(e) => {
            if (!inlineOpen && (e.key === "ArrowDown" || e.key === "Enter") && orderedResults.length > 0) {
              setInlineOpen(true);
            }
            handleListKeyDown(e, {
              allowArrowNavigation: Boolean(inlineOpen && orderedResults.length > 0),
            });
          }}
          placeholder="Search projects, artifacts, templates, gates…"
          autoComplete="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={showInlinePanel}
          aria-controls="global-search-results-inline"
          aria-autocomplete="list"
          data-testid="global-search-input"
          className={inputClass}
        />
        {showInlinePanel ? (
          <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-[min(420px,70vh)] overflow-auto rounded-lg border bg-popover text-popover-foreground shadow-md">
            <SearchResultsList
              query={query}
              loading={loading}
              orderedResults={orderedResults}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
              onPick={go}
              listboxId="global-search-results-inline"
            />
          </div>
        ) : null}
      </div>

      <dialog
        ref={dialogRef}
        className="fixed inset-0 z-[100] max-h-none max-w-none bg-slate-900/50 p-0 backdrop:bg-transparent"
        aria-labelledby="global-search-palette-title"
        onClose={() => setPaletteOpen(false)}
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
      >
        <div
          className="mx-auto mt-[12vh] w-[min(100vw-1.5rem,520px)] rounded-xl border bg-card p-4 shadow-2xl"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
        >
          <p id="global-search-palette-title" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Global search
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">/</kbd> or{" "}
            <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">⌘K</kbd> · Arrow keys · Enter
            to open
          </p>
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={paletteInputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) =>
                handleListKeyDown(e, {
                  allowArrowNavigation: Boolean(paletteOpen && orderedResults.length > 0),
                })
              }
              placeholder="Search projects, artifacts, templates, gates…"
              autoComplete="off"
              spellCheck={false}
              role="combobox"
              aria-expanded={Boolean(paletteHasList && orderedResults.length > 0)}
              aria-controls="global-search-results-palette"
              data-testid="global-search-palette-input"
              className={inputClass}
            />
          </div>
          {paletteOpen ? (
            <div className="mt-2 max-h-[min(420px,55vh)] overflow-auto rounded-lg border bg-popover text-popover-foreground">
              <SearchResultsList
                query={query}
                loading={loading}
                orderedResults={orderedResults}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
                onPick={go}
                listboxId="global-search-results-palette"
              />
            </div>
          ) : null}
        </div>
      </dialog>
    </>
  );
}
