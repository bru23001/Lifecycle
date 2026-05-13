import { describe, expect, it } from "vitest";

import { buildDashboardSettingsAlerts } from "@/lib/dashboard-settings-alerts";

describe("buildDashboardSettingsAlerts", () => {
  it("returns empty array when all counts are zero", () => {
    expect(
      buildDashboardSettingsAlerts({
        lifecycleNonActive: 0,
        templateAttention: 0,
        gateNonActive: 0,
      }),
    ).toEqual([]);
  });

  it("emits lifecycle, template, and gate alerts in order with correct routes", () => {
    const alerts = buildDashboardSettingsAlerts({
      lifecycleNonActive: 2,
      templateAttention: 1,
      gateNonActive: 3,
    });
    expect(alerts).toHaveLength(3);
    expect(alerts[0]?.id).toBe("lifecycle-configuration");
    expect(alerts[0]?.ctaHref).toBe("/settings/lifecycle");
    expect(alerts[1]?.id).toBe("template-registry");
    expect(alerts[1]?.ctaHref).toBe("/settings/templates");
    expect(alerts[2]?.id).toBe("gate-rules");
    expect(alerts[2]?.ctaHref).toBe("/settings/gates");
  });
});
