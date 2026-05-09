"use client";

import { CircleAlert, Database, Edit3, FileText, ShieldCheck, Upload, UserLock, Workflow } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SettingsSectionId } from "@/types/settings.types";

export type StatusTone = "green" | "gray" | "amber" | "red";

export const settingsStatusBadgeMap: Record<
  "active" | "inactive" | "draft" | "deprecated" | "archived",
  { label: string; tone: StatusTone }
> = {
  active: { label: "Active", tone: "green" },
  inactive: { label: "Inactive", tone: "gray" },
  draft: { label: "Draft", tone: "amber" },
  deprecated: { label: "Deprecated", tone: "red" },
  archived: { label: "Archived", tone: "gray" },
};

const toneClass: Record<StatusTone, string> = {
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  gray: "border-slate-200 bg-slate-50 text-slate-700",
  amber: "border-amber-200 bg-amber-50 text-amber-900",
  red: "border-rose-200 bg-rose-50 text-rose-800",
};

export const sectionIconMap: Record<SettingsSectionId, React.ComponentType<{ className?: string }>> = {
  lifecycle_configuration: Workflow,
  template_registry: FileText,
  gate_rules: ShieldCheck,
  roles_permissions: UserLock,
  export_settings: Upload,
  local_storage_settings: Database,
};

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function Badge({
  label,
  tone,
}: {
  label: string;
  tone: StatusTone;
}) {
  return (
    <span className={cn("inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold", toneClass[tone])}>
      {label}
    </span>
  );
}

export function SectionHeader({
  title,
  description,
  actionLabel,
  onActionClick,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onActionClick?: () => void;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      {actionLabel && onActionClick ? (
        <Button type="button" variant="outline" size="sm" onClick={onActionClick}>
          <Edit3 className="size-3.5" aria-hidden />
          {actionLabel}
        </Button>
      ) : null}
    </header>
  );
}

export function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 px-3 py-2">
      <span className="text-sm text-slate-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 rounded-full transition",
          checked ? "bg-blue-600" : "bg-slate-300",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-white transition",
            checked ? "left-5" : "left-0.5",
          )}
        />
      </button>
    </label>
  );
}

export function MetaRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

export function PanelSkeleton({ heightClass }: { heightClass: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-slate-100", heightClass)} />;
}

export function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="mt-3 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-900">
      <div className="flex items-center gap-2">
        <CircleAlert className="size-4" aria-hidden />
        <p>{message}</p>
      </div>
      <Button type="button" size="sm" variant="outline" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
