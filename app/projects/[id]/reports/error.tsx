"use client";

import Link from "next/link";

export default function ReportsSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-6 py-16 text-center">
      <h1 className="text-lg font-semibold text-slate-900">Report unavailable</h1>
      <p className="text-sm text-slate-600">
        This report could not be loaded. Try again, or open the project from the project list.
      </p>
      {process.env.NODE_ENV === "development" ? (
        <p className="break-all font-mono text-xs text-red-700">{error.message}</p>
      ) : null}
      <div className="flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex h-9 items-center rounded-md bg-[#2563eb] px-3 text-sm font-semibold text-white hover:bg-[#1d4ed8]"
        >
          Try again
        </button>
        <Link
          href="/projects"
          className="inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 hover:bg-slate-50"
        >
          Projects
        </Link>
      </div>
    </div>
  );
}
