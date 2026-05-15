"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Bell, CircleHelp, Download, PanelLeftClose, PanelLeftOpen, Settings } from "lucide-react";

import { NOTIFICATIONS_HUB_HREF } from "@/lib/notifications-hub";

import { Button } from "@/components/ui/button";
import { GlobalSearchField } from "@/components/lifecycle-workspace/global-search-field";
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

function PageTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h1
      className={cn(
        "truncate text-2xl font-semibold tracking-tight text-foreground",
        className,
      )}
    >
      {children}
    </h1>
  );
}

function Notifications({ count = 0, href }: { count?: number; href?: string | null }) {
  const resolvedHref = href ?? NOTIFICATIONS_HUB_HREF;
  const content = (
    <>
      {count > 0 ? (
        <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-[#2563eb] text-[10px] font-semibold text-white">
          {count > 9 ? "9+" : count}
        </span>
      ) : null}
      <Bell className="size-[18px]" strokeWidth={2} />
    </>
  );
  const ariaOpen =
    count > 0
      ? `Notifications: ${count} open approval${count === 1 ? "" : "s"}. Open notification center.`
      : "Open notification center.";
  return (
    <Link
      href={resolvedHref}
      className="relative inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none ring-offset-background transition hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={ariaOpen}
      data-testid="header-notification-bell"
    >
      {content}
    </Link>
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

function UserMenu({
  initials,
  name,
  role,
}: {
  initials: string;
  name?: string;
  role?: string;
}) {
  const showLabel = Boolean(name?.trim() || role?.trim());
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
      {showLabel ? (
        <div className="hidden leading-tight xl:block">
          {name?.trim() ? (
            <p className="text-[12px] font-semibold text-foreground">{name.trim()}</p>
          ) : null}
          {role?.trim() ? (
            <p className="text-[10px] text-muted-foreground">{role.trim()}</p>
          ) : null}
        </div>
      ) : null}
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
  userName,
  userRole,
  notificationCount,
  notificationHref,
  settingsHref,
  actionButtonLabel,
  actionButtonAriaLabel,
  onActionButtonClick,
}: {
  userInitials: string;
  userName?: string;
  userRole?: string;
  notificationCount?: number;
  /** When set, notification bell navigates to first pending approval (spec §12). */
  notificationHref?: string | null;
  /** When set, shows Settings link (dashboard / platform configuration). */
  settingsHref?: string | null;
  actionButtonLabel?: string;
  actionButtonAriaLabel?: string;
  onActionButtonClick?: () => void;
}) {
  return (
    <div className="flex items-center gap-1 sm:gap-2" role="toolbar" aria-label="Global actions">
      <GlobalSearchField />
      {onActionButtonClick && actionButtonLabel ? (
        <HeaderActionButton
          onClick={onActionButtonClick}
          label={actionButtonLabel}
          ariaLabel={actionButtonAriaLabel}
        />
      ) : null}
      <WorkspaceThemeToggle />
      <Notifications count={notificationCount} href={notificationHref} />
      {settingsHref ? (
        <Link
          href={settingsHref}
          className="relative inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none ring-offset-background transition hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Open settings"
          data-testid="header-settings-shortcut"
        >
          <Settings className="size-[18px]" strokeWidth={2} aria-hidden />
        </Link>
      ) : null}
      <Help />
      <UserMenu initials={userInitials} name={userName} role={userRole} />
    </div>
  );
}

export type TopHeaderProps = {
  title: string;
  userInitials?: string;
  /** Optional; shown next to avatar when provided. */
  userName?: string;
  userRole?: string;
  /** Shown between title and global actions (e.g. Template Wizard autosave). */
  autosaveLabel?: string | null;
  notificationCount?: number;
  /**
   * Bell destination; when omitted, defaults to `/notifications` (dashboard spec §24).
   * Pass an explicit URL when a screen should deep-link elsewhere.
   */
  notificationHref?: string | null;
  /** When set, header shows a Settings icon linking to platform configuration (dashboard spec §23). */
  settingsHref?: string | null;
  /** Optional header action button (e.g., Export Matrix, Download Review Package). */
  actionButtonLabel?: string;
  actionButtonAriaLabel?: string;
  onActionButtonClick?: () => void;
  /** @deprecated use `actionButton*` props. */
  onDownloadReviewPackage?: () => void;
};

export function TopHeader({
  title,
  userInitials = "?",
  userName,
  userRole,
  autosaveLabel,
  notificationCount = 0,
  notificationHref,
  settingsHref,
  actionButtonLabel,
  actionButtonAriaLabel,
  onActionButtonClick,
  onDownloadReviewPackage,
}: TopHeaderProps) {
  const resolvedActionHandler = onActionButtonClick ?? onDownloadReviewPackage;
  const resolvedActionLabel = actionButtonLabel ?? (onDownloadReviewPackage ? "Download Review Package" : undefined);
  const resolvedActionAriaLabel = actionButtonAriaLabel ?? resolvedActionLabel;

  return (
    <header className="flex h-[var(--header-height)] min-h-[var(--header-height)] shrink-0 items-start justify-between gap-4 border-b bg-card pt-[var(--header-content-top)] pl-0 pr-6">
      <div className="flex min-w-0 items-start pl-[var(--header-toggle-from-sidebar)]">
        <SidebarToggle className="shrink-0" />
        <PageTitle className="ml-[var(--header-title-margin-after-toggle)]">{title}</PageTitle>
      </div>
      <div className="flex min-w-0 shrink-0 items-start gap-4">
        {autosaveLabel ? (
          <p className="hidden text-sm text-muted-foreground lg:block" role="status" aria-live="polite">
            {autosaveLabel}
          </p>
        ) : null}
        <GlobalActions
          userInitials={userInitials}
          userName={userName}
          userRole={userRole}
          notificationCount={notificationCount}
          notificationHref={notificationHref}
          settingsHref={settingsHref}
          actionButtonLabel={resolvedActionLabel}
          actionButtonAriaLabel={resolvedActionAriaLabel}
          onActionButtonClick={resolvedActionHandler}
        />
      </div>
    </header>
  );
}
