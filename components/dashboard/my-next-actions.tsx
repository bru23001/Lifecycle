import Link from "next/link";
import { Clock3, FileText } from "lucide-react";

import type { DashboardNextAction } from "@/types/dashboard.types";

function actionTone(action: DashboardNextAction): "warning" | "info" | "danger" | "purple" {
  if (action.dueTone.includes("amber")) return "warning";
  if (action.dueTone.includes("rose")) return "danger";
  if (action.dueTone.includes("purple") || action.dueTone.includes("fuchsia")) return "purple";
  return "info";
}

function ToneIcon({
  tone,
  icon,
}: {
  tone: "warning" | "info" | "danger" | "purple";
  icon: "clock" | "file";
}) {
  const toneClasses = {
    warning: "bg-amber-50 text-amber-500",
    info: "bg-blue-50 text-blue-600",
    danger: "bg-red-50 text-red-500",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div
      className={[
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
        toneClasses[tone],
      ].join(" ")}
    >
      {icon === "clock" ? (
        <Clock3 className="h-4 w-4 stroke-[2.3]" />
      ) : (
        <FileText className="h-4 w-4 stroke-[2.3]" />
      )}
    </div>
  );
}

function DueBadge({ label, tone }: { label: string; tone: "warning" | "info" | "danger" | "purple" }) {
  const toneClasses = {
    warning: "bg-amber-50 text-amber-600",
    info: "bg-blue-50 text-blue-700",
    danger: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-700",
  };

  return (
    <span className={["rounded-full px-3 py-1 text-xs font-semibold", toneClasses[tone]].join(" ")}>
      {label}
    </span>
  );
}

export function MyNextActions({ nextActions }: { nextActions: DashboardNextAction[] }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-[var(--cc-border)] dark:bg-card">
      <header className="flex items-center justify-between px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-100">My Next Actions</h2>
        <Link href="/projects" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          View all actions
        </Link>
      </header>

      <div className="lifecycle-scroll-on-demand min-h-0 flex-1 overflow-auto">
        {nextActions.map((action, index) => {
          const tone = actionTone(action);
          const icon = action.title.toLowerCase().includes("review gate") ? "clock" : "file";
          return (
            <Link
              key={action.id}
              href={action.targetHref}
              className={[
                "grid grid-cols-[36px_1fr_auto] items-center gap-3 px-5 py-3.5",
                index !== 0 && "border-t border-slate-100",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <ToneIcon tone={tone} icon={icon} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-950 dark:text-slate-100">
                  {action.title}
                </p>
                <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-300">
                  {action.projectName}
                </p>
              </div>
              <DueBadge label={action.dueLabel} tone={tone} />
            </Link>
          );
        })}
      </div>

    </article>
  );
}
