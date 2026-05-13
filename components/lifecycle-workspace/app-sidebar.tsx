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
  | "settings";

type AppSidebarItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  active: boolean;
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
      : "/projects");
  const continueCardHref = continueWorkingHref ?? resolvedWorkspaceHref;
  const resolvedGatesHref =
    gatesHref ??
    (hasProject ? `/projects/${projectId}/gates` : "/projects");

  const toggleCollapsed = () => {
    const nextValue = !collapsed;
    onCollapsedChange?.(nextValue);
    if (controlledCollapsed === undefined) {
      setUncontrolledCollapsed(nextValue);
    }
  };

  const navItems: AppSidebarItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: Home, active: active === "dashboard" },
    { label: "Projects", href: "/projects", icon: FolderOpen, active: active === "projects" },
    {
      label: "Lifecycle Workspace",
      href: resolvedWorkspaceHref,
      icon: Layers3,
      active: active === "lifecycle",
    },
    {
      label: "Gates",
      href: resolvedGatesHref,
      icon: ShieldCheck,
      active: active === "gates",
    },
    {
      label: "Artifacts",
      href: hasProject ? `/projects/${projectId}/artifacts` : "/projects",
      icon: FileText,
      active: active === "artifacts",
    },
    {
      label: "Evidence",
      href: hasProject ? `/projects/${projectId}/evidence` : "/projects",
      icon: SearchCheck,
      active: active === "evidence",
    },
    {
      label: "Traceability",
      href: hasProject ? `/projects/${projectId}/traceability` : "/projects",
      icon: GitBranch,
      active: active === "traceability",
    },
    { label: "Approvals", href: "/approvals", icon: CheckCircle2, active: active === "approvals" },
    { label: "Notifications", href: "/notifications", icon: Bell, active: active === "notifications" },
    {
      label: "Reports",
      href: hasProject ? `/projects/${projectId}/reports` : "/projects",
      icon: BarChart3,
      active: active === "reports",
    },
    { label: "Settings", href: "/settings", icon: Settings, active: active === "settings" },
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
      <div className="flex h-[152px] items-center gap-2.5 border-b border-white/10 px-[18px]">
        <div className={cn("relative overflow-hidden", collapsed ? "h-16 w-16" : "h-[72px] w-full")}>
          <Image
            src={collapsed ? lifecycleLogoCollapsed : lifecycleLogo}
            alt="Lifecycle Platform"
            fill
            sizes={collapsed ? "64px" : "360px"}
            className="object-contain object-left"
            priority
          />
        </div>
      </div>

      <nav className="flex-1 space-y-[3px] overflow-y-auto px-3 py-[18px]" aria-label="Primary navigation">
        {navItems.map(({ label, href, icon: Icon, active: itemActive }) => (
          <Link
            key={label}
            href={href}
            aria-current={itemActive ? "page" : undefined}
            title={collapsed ? label : undefined}
            className={cn(
              "flex h-[37px] items-center gap-3 rounded-[7px] px-3 text-[12px] font-medium transition",
              itemActive
                ? "bg-[#2563eb] text-white shadow-[0_10px_22px_rgba(37,99,235,0.22)]"
                : "text-slate-300 hover:bg-white/10 hover:text-white",
              collapsed && "justify-center px-2",
            )}
          >
            <Icon className="size-[14px] shrink-0" aria-hidden />
            {!collapsed ? <span className="truncate">{label}</span> : null}
          </Link>
        ))}
      </nav>

      <div className="px-4 pb-[18px]">
        {!collapsed && hasProject && projectName ? (
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
    </aside>
  );
}
