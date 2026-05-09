"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  BarChart3,
  ChevronRight,
  ClipboardCheck,
  FileStack,
  FolderKanban,
  GitBranch,
  LayoutDashboard,
  LifeBuoy,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Shield,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { AppShellLayoutContext } from "@/components/lifecycle-workspace/app-shell-layout-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AppShellSubItem = {
  label: string;
  href: string;
};

export type AppShellNavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  active?: boolean;
  children?: AppShellSubItem[];
};

/** @deprecated Use `Breadcrumbs` from `@/components/lifecycle-workspace/breadcrumbs` */
export { Breadcrumbs as WorkspaceBreadcrumbs } from "@/components/lifecycle-workspace/breadcrumbs";

export function AuthenticatedAppShell({
  projectId,
  projectName,
  phaseSummary,
  phaseProgressPct,
  navActive = "lifecycle",
  gatesHref,
  children,
}: {
  projectId: string;
  projectName: string;
  phaseSummary: string;
  phaseProgressPct: number;
  /** Highlight current sidebar section. */
  navActive?:
    | "dashboard"
    | "lifecycle"
    | "gates"
    | "templates"
    | "traceability"
    | "artifacts"
    | "evidence"
    | "reports"
    | "settings";
  /** Optional destination for the Gates nav item (defaults to project root). */
  gatesHref?: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = useCallback(() => {
    setCollapsed((c) => !c);
  }, []);

  const layoutValue = useMemo(
    () => ({
      sidebarCollapsed: collapsed,
      toggleSidebar,
    }),
    [collapsed, toggleSidebar],
  );

  const lifecycleHref = `/projects/${projectId}/workspace`;
  const requirementsHref = `/projects/${projectId}/requirements`;
  const featuresHref = `/projects/${projectId}/features`;
  const traceabilityHref = `/projects/${projectId}/traceability`;
  const gateDecisionHref = `/projects/${projectId}/gate/g1`;
  const gateReviewHref = gatesHref ?? `/projects/${projectId}/gates/g2/review`;
  const artifactLibraryHref = `/projects/${projectId}/artifacts`;
  const artifactDetailHref = `/projects/${projectId}/artifacts/artifact-a-3-2`;
  const templatesHref = `/projects/${projectId}/templates/a-3-2`;
  const templateFormHref = `/projects/${projectId}/form/A-3.2`;
  const evidenceHref = `/projects/${projectId}/evidence`;
  const reportsHref = `/projects/${projectId}/reports`;

  const navItems: AppShellNavItem[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      active: navActive === "dashboard",
    },
    {
      label: "Projects",
      href: "/projects",
      icon: FolderKanban,
      children: [
        { label: "All Projects", href: "/projects" },
        { label: "Active Projects", href: "/projects?status=active" },
        { label: "New Project", href: "/projects/new" },
      ],
    },
    {
      label: "Lifecycle",
      href: lifecycleHref,
      icon: Workflow,
      active: navActive === "lifecycle",
      children: [
        { label: "Lifecycle Workspace", href: lifecycleHref },
        { label: "Requirements Register", href: requirementsHref },
        { label: "Features Register", href: featuresHref },
      ],
    },
    {
      label: "Artifacts",
      href: artifactLibraryHref,
      icon: FileStack,
      active: navActive === "artifacts",
      children: [
        { label: "Artifact Library", href: artifactLibraryHref },
        { label: "Artifact Detail", href: artifactDetailHref },
      ],
    },
    {
      label: "Gates",
      href: gateReviewHref,
      icon: ShieldCheck,
      active: navActive === "gates",
      children: [
        { label: "Gate Decision (G1)", href: gateDecisionHref },
        { label: "Gate Review", href: gateReviewHref },
      ],
    },
    { label: "Approvals", href: "/approvals", icon: ClipboardCheck },
    {
      label: "Traceability",
      href: traceabilityHref,
      icon: GitBranch,
      active: navActive === "traceability",
    },
    { label: "Reports", href: reportsHref, icon: BarChart3, active: navActive === "reports" },
    {
      label: "Templates",
      href: templatesHref,
      icon: BadgeCheck,
      active: navActive === "templates",
      children: [
        { label: "Template Wizard", href: templatesHref },
        { label: "Template Form", href: templateFormHref },
      ],
    },
    { label: "Evidence", href: evidenceHref, icon: ClipboardCheck, active: navActive === "evidence" },
    { label: "Settings", href: "/settings", icon: Settings, active: navActive === "settings" },
  ];

  return (
    <AppShellLayoutContext.Provider value={layoutValue}>
      <div className="flex min-h-full bg-[#f8fafc]">
        <aside
          id="app-sidebar"
          className={cn(
            "relative z-30 flex shrink-0 flex-col border-r border-white/10 bg-[#071326] text-sidebar",
            collapsed ? "w-[74px]" : "w-[246px]",
          )}
        >
          <div className="flex h-[74px] items-center gap-2.5 border-b border-white/10 px-3.5">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg border border-white/15 bg-[#0b5ecf] text-white">
              <Shield className="size-4" aria-hidden />
            </div>
            {!collapsed && (
              <div className="min-w-0 leading-tight">
                <p className="truncate text-[13px] font-semibold text-white">Lifecycle Manager</p>
                <p className="truncate text-[9px] uppercase tracking-[0.12em] text-slate-300">
                  Governance & Delivery
                </p>
              </div>
            )}
          </div>

          <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 py-3">
            {navItems.map(({ label, href, icon: Icon, active, children: subItems }) => (
              <div key={label}>
                <Link
                  href={href}
                  className={cn(
                    "flex h-9 items-center gap-2.5 rounded-md px-2.5 text-[12px] font-medium transition",
                    active
                      ? "bg-[#0b66e8] text-white shadow-[0_8px_16px_rgba(11,102,232,0.25)]"
                      : "text-slate-200 hover:bg-white/8 hover:text-white",
                    collapsed && "justify-center px-2",
                  )}
                  aria-current={active ? "page" : undefined}
                  title={collapsed ? label : undefined}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  {!collapsed && <span className="truncate">{label}</span>}
                  {!collapsed && subItems && (
                    <ChevronRight className="ml-auto size-3.5 text-slate-300" aria-hidden />
                  )}
                </Link>

                {!collapsed && subItems && (
                  <div className="mt-1 space-y-0.5 pl-8">
                    {subItems.map((sub) => (
                      <Link
                        key={sub.label}
                        href={sub.href}
                        className="block rounded px-2 py-1 text-[11px] text-slate-300 hover:bg-white/7 hover:text-white"
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="border-t border-white/10 p-2.5">
            {!collapsed && (
              <div className="mb-2 rounded-lg border border-white/10 bg-[#0d1b2f] px-3 py-2.5">
                <p className="text-[10px] font-medium text-slate-300">Current Context</p>
                <p className="mt-1 truncate text-[12px] font-semibold text-white">{projectName}</p>
                <p className="mt-0.5 truncate text-[10px] text-slate-400">{phaseSummary}</p>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700">
                  <div
                    className="h-full rounded-full bg-[#2d8cff] transition-[width]"
                    style={{ width: `${phaseProgressPct}%` }}
                  />
                </div>
              </div>
            )}

            <Link
              href={`/projects/${projectId}/workspace`}
              className={cn(
                "flex h-9 items-center rounded-md px-2.5 text-[12px] font-medium text-slate-100 hover:bg-white/8",
                collapsed ? "justify-center" : "gap-2",
              )}
              title={collapsed ? "Help & Support" : undefined}
            >
              <LifeBuoy className="size-4" aria-hidden />
              {!collapsed && <span>Help & Support</span>}
            </Link>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "mt-1 w-full text-slate-400 hover:bg-white/10 hover:text-white",
                collapsed ? "justify-center px-0" : "justify-start gap-2",
              )}
              onClick={() => setCollapsed((c) => !c)}
            >
              {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
              {!collapsed && <span>Collapse</span>}
            </Button>
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
      </div>
    </AppShellLayoutContext.Provider>
  );
}
