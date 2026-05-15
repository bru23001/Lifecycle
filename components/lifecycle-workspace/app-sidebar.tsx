"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronRight,
  FileText,
  FolderOpen,
  GitBranch,
  Home,
  Layers3,
  PanelLeftClose,
  PanelLeftOpen,
  SearchCheck,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import lifecycleLogoCollapsed from "@/lifecycle-logo-blanco.png";
import lifecycleLogo from "@/lifecycle-logo-largo-blanco.png";
import { cn } from "@/lib/utils";

export type AppSidebarActive =
  | "dashboard"
  | "projects"
  | "lifecycle"
  | "gates"
  | "traceability"
  | "artifacts"
  | "evidence"
  | "approvals"
  | "notifications"
  | "reports"
  /** `/settings/lifecycle` and other settings areas except the template registry. */
  | "settings"
  /** `/settings/templates` and related template admin routes. */
  | "template_registry";

type AppSidebarItem =
  | {
      kind: "link";
      label: string;
      href: string;
      icon: ComponentType<{ className?: string }>;
      active: boolean;
    }
  | {
      kind: "disabled";
      label: string;
      icon: ComponentType<{ className?: string }>;
      active: boolean;
      tooltip: string;
    };

export function AppSidebar({
  active,
  projectId,
  projectName,
  phaseSummary,
  phaseProgressPct,
  workspaceHref,
  gatesHref,
  projectCurrentPhase,
  navPhaseScope,
  continueWorkingHref,
  className,
  id = "app-sidebar",
  collapsed: controlledCollapsed,
  onCollapsedChange,
}: {
  active: AppSidebarActive;
  projectId?: string | null;
  projectName?: string;
  phaseSummary?: string;
  phaseProgressPct?: number;
  workspaceHref?: string;
  gatesHref?: string;
  /** Workspace phase 1–14; drives default Gates link when `gatesHref` is not set. */
  projectCurrentPhase?: number | null;
  /** Viewed workspace phase for Artifacts / Evidence / Traceability `?phase=` links. */
  navPhaseScope?: number | null;
  /** Overrides the sidebar card CTA when continuing the next required action. */
  continueWorkingHref?: string;
  className?: string;
  id?: string;
  collapsed?: boolean;
  onCollapsedChange?: (value: boolean) => void;
}) {
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(false);
  const collapsed = controlledCollapsed ?? uncontrolledCollapsed;
  const hasProject = Boolean(projectId);
  const resolvedWorkspaceHref =
    workspaceHref ??
    (hasProject
      ? projectCurrentPhase != null
        ? `/projects/${projectId}/workspace?phase=${projectCurrentPhase}`
        : `/projects/${projectId}/workspace`
      : null);
  const continueCardHref =
    continueWorkingHref ?? resolvedWorkspaceHref ?? "/projects";
  const resolvedGatesHref =
    gatesHref ??
    (hasProject ? `/projects/${projectId}/gates` : "/projects");

  const scopedPhase =
    typeof navPhaseScope === "number" && navPhaseScope >= 1 && navPhaseScope <= 14
      ? navPhaseScope
      : projectCurrentPhase != null && projectCurrentPhase >= 1 && projectCurrentPhase <= 14
        ? projectCurrentPhase
        : null;
  const phaseQuerySuffix = scopedPhase != null ? `?phase=${scopedPhase}` : "";

  const toggleCollapsed = () => {
    const nextValue = !collapsed;
    onCollapsedChange?.(nextValue);
    if (controlledCollapsed === undefined) {
      setUncontrolledCollapsed(nextValue);
    }
  };

  const navItems: AppSidebarItem[] = [
    { kind: "link", label: "Dashboard", href: "/dashboard", icon: Home, active: active === "dashboard" },
    { kind: "link", label: "Projects", href: "/projects", icon: FolderOpen, active: active === "projects" },
    hasProject && resolvedWorkspaceHref
      ? {
          kind: "link" as const,
          label: "Lifecycle Workspace",
          href: resolvedWorkspaceHref,
          icon: Layers3,
          active: active === "lifecycle",
        }
      : {
          kind: "disabled" as const,
          label: "Lifecycle Workspace",
          icon: Layers3,
          active: active === "lifecycle",
          tooltip: "Select a project on the Projects screen to open the lifecycle workspace.",
        },
    {
      kind: "link",
      label: "Gates",
      href: resolvedGatesHref,
      icon: ShieldCheck,
      active: active === "gates",
    },
    {
      kind: "link",
      label: "Artifacts",
      href: hasProject ? `/projects/${projectId}/artifacts${phaseQuerySuffix}` : "/projects",
      icon: FileText,
      active: active === "artifacts",
    },
    {
      kind: "link",
      label: "Evidence",
      href: hasProject ? `/projects/${projectId}/evidence${phaseQuerySuffix}` : "/projects",
      icon: SearchCheck,
      active: active === "evidence",
    },
    {
      kind: "link",
      label: "Traceability",
      href: hasProject ? `/projects/${projectId}/traceability${phaseQuerySuffix}` : "/projects",
      icon: GitBranch,
      active: active === "traceability",
    },
    { kind: "link", label: "Approvals", href: "/approvals", icon: CheckCircle2, active: active === "approvals" },
    { kind: "link", label: "Notifications", href: "/notifications", icon: Bell, active: active === "notifications" },
    {
      kind: "link",
      label: "Reports",
      href: hasProject ? `/projects/${projectId}/reports` : "/projects",
      icon: BarChart3,
      active: active === "reports",
    },
    {
      kind: "link",
      label: "Template Registry",
      href: hasProject
        ? `/settings/templates?projectId=${encodeURIComponent(String(projectId))}`
        : "/settings/templates",
      icon: FileText,
      active: active === "template_registry",
    },
    { kind: "link", label: "Settings", href: "/settings/lifecycle", icon: Settings, active: active === "settings" },
  ];

  return (
    <aside
      id={id}
      className={cn(
        "z-30 flex h-dvh w-full min-w-0 max-w-[var(--sidebar-width)] flex-col border-r border-white/10 bg-[#071326] text-white",
        collapsed && "max-w-[var(--sidebar-collapsed-width)]",
        className,
      )}
    >
      <div className="flex h-[var(--sidebar-logo-height)] shrink-0 items-center border-b border-white/10 px-0">
        <div className="relative h-full w-full overflow-hidden">
          <Image
            src={collapsed ? lifecycleLogoCollapsed : lifecycleLogo}
            alt="Lifecycle Platform"
            fill
            sizes={collapsed ? "69px" : "213px"}
            className="object-contain object-left"
            priority
          />
        </div>
      </div>

      <div className="flex h-[var(--sidebar-menu-height)] min-h-0 flex-col overflow-hidden">
        <nav
          className="min-h-0 flex-1 space-y-[3px] overflow-y-auto px-3 py-[18px]"
          aria-label="Primary navigation"
        >
          {navItems.map((item) => {
            const { label, icon: Icon, active: itemActive } = item;
            const rowClass = cn(
              "flex h-[37px] items-center gap-3 rounded-[7px] px-3 text-[12px] font-medium transition",
              itemActive
                ? "bg-[#2563eb] text-white shadow-[0_10px_22px_rgba(37,99,235,0.22)]"
                : "text-slate-300 hover:bg-white/10 hover:text-white",
              collapsed && "justify-center px-2",
            );

            if (item.kind === "disabled") {
              return (
                <span
                  key={label}
                  className="block w-full min-w-0"
                  title={item.tooltip}
                >
                  <span
                    className={cn(
                      rowClass,
                      "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-slate-300",
                    )}
                    aria-disabled="true"
                    aria-label={`${label} (unavailable: ${item.tooltip})`}
                  >
                    <Icon className="size-[14px] shrink-0" aria-hidden />
                    {!collapsed ? <span className="truncate">{label}</span> : null}
                  </span>
                </span>
              );
            }

            return (
              <Link
                key={label}
                href={item.href}
                aria-current={itemActive ? "page" : undefined}
                title={collapsed ? label : undefined}
                className={rowClass}
              >
                <Icon className="size-[14px] shrink-0" aria-hidden />
                {!collapsed ? <span className="truncate">{label}</span> : null}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 px-4 pb-[18px]">
        {!collapsed && hasProject && projectName && resolvedWorkspaceHref ? (
          <div className="mb-3 rounded-[9px] border border-white/10 bg-[#0d1b2f] p-[11px]">
            <p className="text-[11px] font-medium text-slate-300">Continue Working</p>
            <p className="mt-[16px] truncate text-[12px] font-semibold">{projectName}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {projectCurrentPhase != null ? (
                <Link
                  href={resolvedWorkspaceHref}
                  className="inline-flex shrink-0 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[9px] font-semibold text-slate-200 hover:bg-white/10"
                >
                  Phase {projectCurrentPhase}
                </Link>
              ) : null}
              {phaseSummary ? (
                <Link
                  href={resolvedWorkspaceHref}
                  className="min-w-0 flex-1 truncate text-left text-[9px] text-slate-400 underline-offset-2 hover:text-slate-200 hover:underline"
                >
                  {phaseSummary}
                </Link>
              ) : null}
            </div>
            <Link
              href={resolvedWorkspaceHref}
              className="mt-[11px] block rounded-full outline-none ring-offset-[#0d1b2f] focus-visible:ring-2 focus-visible:ring-[#2563eb]"
              aria-label="Open current phase in lifecycle workspace"
            >
              <div className="h-[6px] rounded-full bg-slate-700">
                <div
                  className="h-[6px] rounded-full bg-[#2563eb]"
                  style={{ width: `${Math.max(0, Math.min(100, phaseProgressPct ?? 0))}%` }}
                />
              </div>
            </Link>
            <Link
              href={continueCardHref}
              className="mt-[12px] flex h-[36px] items-center justify-between rounded-[6px] bg-[#2563eb] px-3 text-[11px] font-semibold text-white"
            >
              {continueWorkingHref ? "Continue" : "Open Project"}
              <ChevronRight className="size-[13px]" aria-hidden />
            </Link>
            {continueWorkingHref ? (
              <Link
                href={resolvedWorkspaceHref}
                className="mt-2 block text-center text-[10px] font-semibold text-slate-300 underline-offset-2 hover:text-white hover:underline"
              >
                Open current phase
              </Link>
            ) : null}
            <Link
              href={`/settings/templates?projectId=${encodeURIComponent(String(projectId))}`}
              className="mt-2 block text-center text-[10px] font-semibold text-slate-300 underline-offset-2 hover:text-white hover:underline"
            >
              Open template registry
            </Link>
          </div>
        ) : null}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "w-full text-[11px] text-slate-400 hover:bg-white/10 hover:text-white",
            collapsed ? "justify-center px-0" : "justify-start gap-2",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          aria-controls={id}
          onClick={toggleCollapsed}
        >
          {collapsed ? <PanelLeftOpen className="size-[12px]" /> : <PanelLeftClose className="size-[12px]" />}
          {!collapsed ? <span>Collapse</span> : null}
        </Button>
        </div>
      </div>
    </aside>
  );
}
