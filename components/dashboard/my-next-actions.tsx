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
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
        toneClasses[tone],
      ].join(" ")}
    >
      {icon === "clock" ? (
        <Clock3 className="h-5 w-5 stroke-[2.3]" />
      ) : (
        <FileText className="h-5 w-5 stroke-[2.3]" />
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
    <span className={["rounded-full px-5 py-2 text-sm font-semibold", toneClasses[tone]].join(" ")}>
      {label}
    </span>
  );
}

export function MyNextActions({ nextActions }: { nextActions: DashboardNextAction[] }) {
  return (
    <article className="h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-[var(--cc-border)] dark:bg-card">
      <header className="flex items-center justify-between px-7 py-6">
        <h2 className="text-xl font-semibold text-slate-950 dark:text-slate-100">My Next Actions</h2>
        <Link href="/projects" className="text-base font-semibold text-blue-600 hover:text-blue-700">
          View all actions
        </Link>
      </header>

      <div>
        {nextActions.map((action, index) => {
          const tone = actionTone(action);
          const icon = action.title.toLowerCase().includes("review gate") ? "clock" : "file";
          return (
            <Link
              key={action.id}
              href={action.targetHref}
              className={[
                "grid grid-cols-[44px_1fr_auto] items-center gap-5 px-7 py-5",
                index !== 0 && "border-t border-slate-100",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <ToneIcon tone={tone} icon={icon} />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-slate-950 dark:text-slate-100">
                  {action.title}
                </p>
                <p className="mt-1 truncate text-base text-slate-500 dark:text-slate-300">
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
