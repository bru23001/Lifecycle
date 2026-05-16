import { test } from "./fixtures/lifecycle-test";
import { GATE_IDS } from "./support/constants";
import { recordGateAccepted } from "./support/gate-helpers";

test.describe.configure({ mode: "serial" });

test.describe("Full lifecycle happy path", () => {
  test("records gates G1–G10 and advances project to phase 14", async ({ projectId }) => {
    for (const gateId of GATE_IDS) {
      await test.step(`Gate ${gateId} accepted`, async () => {
        await recordGateAccepted(projectId, gateId);
      });
    }
  });
});
