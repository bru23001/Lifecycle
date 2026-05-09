import type { ArtifactActivityItem } from "@/types/artifact-library.types";

export function ActivityLog({ items }: { items: ArtifactActivityItem[] }) {
  return (
    <section className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm dark:border-border dark:bg-card">
      <h3 className="text-lg font-semibold text-[#111827] dark:text-foreground">Activity Log</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item.id} className="rounded-xl border border-[#e5e7eb] p-3 text-sm dark:border-border">
            <p className="font-medium text-[#111827] dark:text-foreground">{item.action}</p>
            <p className="mt-1 text-xs text-[#64748b] dark:text-muted-foreground">
              {item.actor} • {item.timestampLabel}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
