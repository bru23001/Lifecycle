"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { NewProjectForm } from "@/components/projects/new-project-form";

export function NewProjectModal({
  open,
  intent,
  defaultOwnerName,
  cancelHref,
}: {
  open: boolean;
  intent: string | null;
  defaultOwnerName: string;
  cancelHref: string;
}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push(cancelHref);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, cancelHref, router]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-project-modal-title"
    >
      <Link
        href={cancelHref}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close new project dialog"
      />
      <div className="relative z-10 mx-4 flex max-h-[min(88vh,900px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl ring-1 ring-black/5 dark:border-slate-700 dark:bg-card">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2
              id="new-project-modal-title"
              className="text-lg font-bold tracking-tight text-slate-950 sm:text-xl"
            >
              New project
            </h2>
            <p className="mt-1 text-[12px] leading-relaxed text-slate-600">
              Identity, lifecycle model, owner, status, scope, and starting phase. You will open the
              workspace after the project is created.
            </p>
          </div>
          <Link
            href={cancelHref}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
            aria-label="Close"
          >
            <X className="size-4" />
          </Link>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
          <NewProjectForm defaultOwnerName={defaultOwnerName} intent={intent} />
        </div>
      </div>
    </div>,
    document.body,
  );
}
