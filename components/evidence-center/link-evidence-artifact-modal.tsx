"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";

import { linkEvidenceToArtifact } from "@/app/actions/evidence";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const inputClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";

export type ArtifactPick = { id: string; label: string };

export function LinkEvidenceArtifactModal({
  open,
  projectId,
  evidenceId,
  artifacts,
  onClose,
}: {
  open: boolean;
  projectId: string;
  evidenceId: string;
  artifacts: ArtifactPick[];
  onClose: () => void;
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [artifactId, setArtifactId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (open) {
      setArtifactId(artifacts[0]?.id ?? "");
      setError(null);
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open, artifacts]);

  const submit = () => {
    if (!artifactId) {
      setError("Select an artifact.");
      return;
    }
    startTransition(async () => {
      const res = await linkEvidenceToArtifact({ evidenceId, artifactId });
      if (res.ok) {
        router.refresh();
        onClose();
      } else {
        setError(res.error);
      }
    });
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="w-[min(100vw-2rem,480px)] rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="link-artifact-title"
    >
      <div className="flex flex-col">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-border">
          <h2 id="link-artifact-title" className="text-lg font-semibold text-slate-900 dark:text-foreground">
            Link evidence to artifact
          </h2>
          <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <X className="size-5" aria-hidden />
          </button>
        </header>
        <div className="space-y-3 px-5 py-4 text-sm">
          {error ? <p className="rounded border border-red-200 bg-red-50 px-2 py-1 text-red-800">{error}</p> : null}
          <p className="text-slate-600">Project: {projectId}</p>
          <label className="block">
            <span className="text-xs font-semibold text-slate-600">Artifact</span>
            <select className={cn(inputClass, "mt-1")} value={artifactId} onChange={(e) => setArtifactId(e.target.value)}>
              {artifacts.length === 0 ? (
                <option value="">No artifacts in project</option>
              ) : (
                artifacts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))
              )}
            </select>
          </label>
        </div>
        <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4 dark:border-border">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" className="bg-[#2563eb] hover:bg-[#1d4ed8]" disabled={pending || !artifactId} onClick={submit}>
            {pending ? "Linking…" : "Link"}
          </Button>
        </footer>
      </div>
    </dialog>
  );
}
