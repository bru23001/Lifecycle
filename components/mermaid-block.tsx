"use client";

import { useEffect, useId, useRef, useState } from "react";

import { toUserMessage } from "@/lib/toUserMessage";

type Props = {
  chart: string;
  className?: string;
};

/** Lazy-loaded so Mermaid’s ESM graph is not wired synchronously into the client bundle (avoids flaky webpack chunk factories). */
let mermaidModulePromise: Promise<typeof import("mermaid").default> | null = null;

function getMermaid() {
  if (!mermaidModulePromise) {
    mermaidModulePromise = import("mermaid").then((m) => m.default);
  }
  return mermaidModulePromise;
}

let mermaidInitialized = false;

export function MermaidBlock({ chart, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reactId = useId().replace(/:/g, "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let cancelled = false;

    void (async () => {
      setError(null);
      const mermaid = await getMermaid();
      if (cancelled) return;
      if (!mermaidInitialized) {
        mermaid.initialize({
          startOnLoad: false,
          theme: "neutral",
          securityLevel: "strict",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        });
        mermaidInitialized = true;
      }

      const renderId = `mm-${reactId}-${Math.random().toString(36).slice(2, 9)}`;
      try {
        const { svg } = await mermaid.render(renderId, chart);
        if (cancelled) return;
        el.innerHTML = svg;
      } catch (e) {
        if (cancelled) return;
        setError(toUserMessage(e));
        el.textContent = "";
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [chart, reactId]);

  return (
    <div className={className}>
      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <div
        ref={ref}
        role="img"
        className="traceability-mermaid flex justify-center overflow-x-auto rounded-xl border bg-muted/20 p-4 [&_svg]:max-w-full"
        aria-label="Traceability diagram"
      />
    </div>
  );
}
