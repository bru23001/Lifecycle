import Link from "next/link";
import { Plus } from "lucide-react";

export function DashboardPageHeader({ userName }: { userName: string }) {
  const displayName = userName.trim() || "there";
  return (
    <section className="span-12 flex flex-col gap-4 min-[901px]:flex-row min-[901px]:items-center min-[901px]:justify-between">
      <div>
        <h1 className="text-[24px] font-bold tracking-[-0.02em]">Welcome back, {displayName}</h1>
        <p className="mt-[5px] text-[13px] text-slate-500">
          Here&apos;s what&apos;s happening with your lifecycle projects.
        </p>
      </div>
      <Link
        href="/projects/new"
        className="inline-flex h-[39px] shrink-0 items-center gap-2 self-start rounded-[6px] bg-[#2563eb] px-[18px] text-[12px] font-semibold text-white shadow-sm min-[901px]:self-auto"
      >
        <Plus className="size-[15px]" aria-hidden />
        New Project
      </Link>
    </section>
  );
}
