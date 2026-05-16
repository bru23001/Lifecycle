import { test } from "./fixtures/lifecycle-test";
import { advanceGateAndAssertPhase } from "./support/gate-helpers";

test.describe("Gate review UI", () => {
  test("submits G1 acceptance through Gate Review screen", async ({ page, projectId }) => {
    await advanceGateAndAssertPhase(page, projectId, "G1");
  });
});
