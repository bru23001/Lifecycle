"use client";

import type { ReactNode } from "react";
import { Bell, CircleHelp, Download, Search } from "lucide-react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppShellLayout } from "@/components/lifecycle-workspace/app-shell-layout-context";
import { WorkspaceThemeToggle } from "@/components/lifecycle-workspace/workspace-theme-toggle";
import { cn } from "@/lib/utils";

function SidebarToggle({ className }: { className?: string }) {
  const { sidebarCollapsed, toggleSidebar } = useAppShellLayout();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={cn("text-muted-foreground", className)}
      aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      aria-expanded={!sidebarCollapsed}
      aria-controls="app-sidebar"
      onClick={toggleSidebar}
    >
      {sidebarCollapsed ? (
        <PanelLeftOpen className="size-4" />
      ) : (
        <PanelLeftClose className="size-4" />
      )}
    </Button>
  );
}

function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground">{children}</h1>;
}

function GlobalSearch() {
  return (
    <div className="relative hidden w-[330px] shrink-0 lg:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        placeholder="Search projects, artifacts, gates, approvals, evidence..."
        className="h-9 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Search projects, artifacts, gates, approvals, evidence"
      />
    </div>
  );
}

function Notifications({ count = 1 }: { count?: number }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="relative text-muted-foreground"
      aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ""}`}
    >
      {count > 0 ? (
        <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-[#2563eb] text-[10px] font-semibold text-white">
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
      <Bell className="size-[18px]" strokeWidth={2} />
    </Button>
  );
}

function Help() {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="text-muted-foreground"
      aria-label="Help"
    >
      <CircleHelp className="size-[18px]" strokeWidth={2} />
    </Button>
  );
}

function UserMenu({ initials }: { initials: string }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="ml-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-[#1d4ed8] text-xs font-semibold text-white outline-none ring-offset-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        aria-label="User menu"
        aria-haspopup="menu"
      >
        {initials}
      </button>
      <div className="hidden leading-tight xl:block">
        <p className="text-[12px] font-semibold text-foreground">Alex Developer</p>
        <p className="text-[10px] text-muted-foreground">Solution Architect</p>
      </div>
    </div>
  );
}

function HeaderActionButton({
  onClick,
  label,
  ariaLabel,
}: {
  onClick: () => void;
  label: string;
  ariaLabel?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="hidden shrink-0 gap-1.5 lg:inline-flex"
      aria-label={ariaLabel}
      onClick={onClick}
    >
      <Download className="size-3.5" aria-hidden />
      {label}
    </Button>
  );
}

function GlobalActions({
  userInitials,
  notificationCount,
  actionButtonLabel,
  actionButtonAriaLabel,
  onActionButtonClick,
}: {
  userInitials: string;
  notificationCount?: number;
  actionButtonLabel?: string;
  actionButtonAriaLabel?: string;
  onActionButtonClick?: () => void;
}) {
  return (
    <div className="flex items-center gap-1 sm:gap-2" role="toolbar" aria-label="Global actions">
      <GlobalSearch />
      {onActionButtonClick && actionButtonLabel ? (
        <HeaderActionButton
          onClick={onActionButtonClick}
          label={actionButtonLabel}
          ariaLabel={actionButtonAriaLabel}
        />
      ) : null}
      <WorkspaceThemeToggle />
      <Notifications count={notificationCount} />
      <Help />
      <UserMenu initials={userInitials} />
    </div>
  );
}

export type TopHeaderProps = {
  title: string;
  userInitials?: string;
  /** Shown between title and global actions (e.g. Template Wizard autosave). */
  autosaveLabel?: string | null;
  notificationCount?: number;
  /** Optional header action button (e.g., Export Matrix, Download Review Package). */
  actionButtonLabel?: string;
  actionButtonAriaLabel?: string;
  onActionButtonClick?: () => void;
  /** @deprecated use `actionButton*` props. */
  onDownloadReviewPackage?: () => void;
};

export function TopHeader({
  title,
  userInitials = "AD",
  autosaveLabel,
  notificationCount = 1,
  actionButtonLabel,
  actionButtonAriaLabel,
  onActionButtonClick,
  onDownloadReviewPackage,
}: TopHeaderProps) {
  const resolvedActionHandler = onActionButtonClick ?? onDownloadReviewPackage;
  const resolvedActionLabel = actionButtonLabel ?? (onDownloadReviewPackage ? "Download Review Package" : undefined);
  const resolvedActionAriaLabel = actionButtonAriaLabel ?? resolvedActionLabel;

  return (
    <header className="flex h-[var(--header-height)] min-h-[var(--header-height)] shrink-0 items-center justify-between gap-4 border-b bg-card px-6">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarToggle />
        <PageTitle>{title}</PageTitle>
      </div>
      <div className="flex min-w-0 shrink-0 items-center gap-4">
        {autosaveLabel ? (
          <p className="hidden text-sm text-muted-foreground lg:block" role="status" aria-live="polite">
            {autosaveLabel}
          </p>
        ) : null}
        <GlobalActions
          userInitials={userInitials}
          notificationCount={notificationCount}
          actionButtonLabel={resolvedActionLabel}
          actionButtonAriaLabel={resolvedActionAriaLabel}
          onActionButtonClick={resolvedActionHandler}
        />
      </div>
    </header>
  );
}
