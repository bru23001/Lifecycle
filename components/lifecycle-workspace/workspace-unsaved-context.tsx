"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

export type WorkspaceUnsavedContextValue = {
  /** Mark whether the workspace has unsaved edits (e.g. phase details form). */
  setUnsaved: (unsaved: boolean) => void;
  /**
   * If unsaved, opens a confirmation dialog; otherwise runs `navigate` immediately.
   * Use for client-side navigation and closing drawers that would discard edits.
   */
  guardNavigation: (navigate: () => void) => void;
};

const WorkspaceUnsavedContext = createContext<WorkspaceUnsavedContextValue | null>(null);

export function useWorkspaceUnsavedGuard(): WorkspaceUnsavedContextValue {
  const ctx = useContext(WorkspaceUnsavedContext);
  if (!ctx) {
    throw new Error("useWorkspaceUnsavedGuard must be used within WorkspaceUnsavedChangesProvider");
  }
  return ctx;
}

export function useWorkspaceUnsavedGuardOptional(): WorkspaceUnsavedContextValue | null {
  return useContext(WorkspaceUnsavedContext);
}

function UnsavedChangesDialog({
  open,
  onStay,
  onLeave,
}: {
  open: boolean;
  onStay: () => void;
  onLeave: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (open) {
      if (!node.open) node.showModal();
    } else if (node.open) {
      node.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onStay}
      data-testid="unsaved-workspace-changes-modal"
      className="fixed left-1/2 top-1/2 z-[110] w-[min(100vw-2rem,440px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-900/40 dark:border-border dark:bg-card"
      aria-labelledby="unsaved-workspace-modal-title"
    >
      <div className="flex flex-col gap-4 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="unsaved-workspace-modal-title" className="text-lg font-semibold text-foreground">
              Discard unsaved changes?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You have edits that have not been saved. If you leave now, those changes will be lost.
            </p>
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-muted-foreground hover:bg-muted"
            aria-label="Close dialog"
            onClick={onStay}
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onStay} data-testid="unsaved-workspace-stay">
            Stay
          </Button>
          <Button type="button" variant="default" size="sm" onClick={onLeave} data-testid="unsaved-workspace-leave">
            Leave without saving
          </Button>
        </div>
      </div>
    </dialog>
  );
}

export function WorkspaceUnsavedChangesProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isUnsaved, setIsUnsavedState] = useState(false);
  const unsavedRef = useRef(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const pendingNavRef = useRef<(() => void) | null>(null);

  const setUnsaved = useCallback((unsaved: boolean) => {
    unsavedRef.current = unsaved;
    setIsUnsavedState(unsaved);
  }, []);

  const guardNavigation = useCallback((navigate: () => void) => {
    if (!unsavedRef.current) {
      navigate();
      return;
    }
    pendingNavRef.current = navigate;
    setConfirmOpen(true);
  }, []);

  const handleStay = useCallback(() => {
    pendingNavRef.current = null;
    setConfirmOpen(false);
  }, []);

  const handleLeave = useCallback(() => {
    const run = pendingNavRef.current;
    pendingNavRef.current = null;
    setConfirmOpen(false);
    setUnsaved(false);
    run?.();
  }, [setUnsaved]);

  useEffect(() => {
    if (!isUnsaved) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isUnsaved]);

  useEffect(() => {
    function onClickCapture(e: MouseEvent) {
      if (!unsavedRef.current) return;
      if (e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.button !== 0) return;
      const target = e.target as Element | null;
      const a = target?.closest?.("a[href]") as HTMLAnchorElement | null | undefined;
      if (!a) return;
      if (a.hasAttribute("download")) return;
      if (a.target === "_blank") return;
      const hrefAttr = a.getAttribute("href");
      if (!hrefAttr || hrefAttr.startsWith("#") || hrefAttr.toLowerCase().startsWith("javascript:")) {
        return;
      }
      let url: URL;
      try {
        url = new URL(hrefAttr, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      const next = `${url.pathname}${url.search}${url.hash}`;
      const cur = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (next === cur) return;

      e.preventDefault();
      e.stopPropagation();
      guardNavigation(() => {
        router.push(next);
      });
    }
    document.addEventListener("click", onClickCapture, true);
    return () => document.removeEventListener("click", onClickCapture, true);
  }, [router, guardNavigation]);

  const value = useMemo(
    () => ({
      setUnsaved,
      guardNavigation,
    }),
    [setUnsaved, guardNavigation],
  );

  return (
    <WorkspaceUnsavedContext.Provider value={value}>
      {children}
      <UnsavedChangesDialog open={confirmOpen} onStay={handleStay} onLeave={handleLeave} />
    </WorkspaceUnsavedContext.Provider>
  );
}
