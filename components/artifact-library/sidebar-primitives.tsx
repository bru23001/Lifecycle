import type { ReactNode } from "react";
import Link from "next/link";

export function SidebarCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-border dark:bg-card sm:p-8">
      <h2 className="text-lg font-semibold text-slate-950 dark:text-foreground sm:text-xl">{title}</h2>
      {children}
    </section>
  );
}

export function OutlineActionLink({
  href,
  children,
  icon,
}: {
  href: string;
  children: ReactNode;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-blue-600 shadow-sm hover:bg-slate-50 dark:border-border dark:bg-card dark:text-blue-400 dark:hover:bg-muted/50 sm:text-base"
    >
      <span className="flex-1 text-center">{children}</span>
      {icon}
    </Link>
  );
}

export function OutlineActionButton({
  children,
  icon,
  disabled,
  onClick,
  ariaLabel,
}: {
  children: ReactNode;
  icon: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-blue-600 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-border dark:bg-card dark:text-blue-400 dark:hover:bg-muted/50 sm:text-base"
    >
      <span className="flex-1 text-center">{children}</span>
      {icon}
    </button>
  );
}
