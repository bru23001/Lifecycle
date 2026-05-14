"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  /** Intercept in-app link navigation when the editor has unsaved edits. */
  navGuard?: {
    shouldBlock: () => boolean;
    onBlockedNavigate: (href: string) => void;
  };
};

/**
 * App breadcrumb trail (e.g. Projects → Project name → screen).
 *
 * @example
 * <Breadcrumbs
 *   items={[
 *     { label: "Projects", href: "/projects" },
 *     { label: "Secure Identity Platform", href: "/projects/sip-001" },
 *     { label: "Lifecycle Workspace" },
 *   ]}
 * />
 */
export function Breadcrumbs({ items, navGuard }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground"
    >
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="size-3.5 opacity-60" aria-hidden />}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-foreground hover:underline"
              onClick={(e) => {
                if (item.href && navGuard?.shouldBlock()) {
                  e.preventDefault();
                  navGuard.onBlockedNavigate(item.href);
                }
              }}
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
