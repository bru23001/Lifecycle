import type { DashboardSettingsAlert } from "@/types/dashboard.types";

export function buildDashboardSettingsAlerts(counts: {
  lifecycleNonActive: number;
  templateAttention: number;
  gateNonActive: number;
}): DashboardSettingsAlert[] {
  const alerts: DashboardSettingsAlert[] = [];

  if (counts.lifecycleNonActive > 0) {
    const n = counts.lifecycleNonActive;
    alerts.push({
      id: "lifecycle-configuration",
      message: `${n} lifecycle phase${n === 1 ? " is" : "s are"} not in Active status — review before teams rely on them.`,
      ctaLabel: "Open lifecycle settings",
      ctaHref: "/settings/lifecycle",
    });
  }

  if (counts.templateAttention > 0) {
    const n = counts.templateAttention;
    alerts.push({
      id: "template-registry",
      message: `${n} template${n === 1 ? "" : "s"} in Draft or Deprecated — confirm registry accuracy.`,
      ctaLabel: "Open template registry",
      ctaHref: "/settings/templates",
    });
  }

  if (counts.gateNonActive > 0) {
    const n = counts.gateNonActive;
    alerts.push({
      id: "gate-rules",
      message: `${n} gate rule${n === 1 ? "" : "s"} not Active — align inputs, evidence, and approvers with governance.`,
      ctaLabel: "Open gate rules",
      ctaHref: "/settings/gates",
    });
  }

  return alerts;
}
