import { describe, expect, it } from "vitest";

import { prometheusTextSnapshot, incrementRequestCount } from "@/lib/server/metrics";

describe("metrics", () => {
  it("emits prometheus text", () => {
    incrementRequestCount({
      method: "GET",
      pathname: "/dashboard",
      statusCode: 200,
    });
    const text = prometheusTextSnapshot();
    expect(text).toContain("cybercube_http_requests_total");
    expect(text).toContain("/dashboard");
  });
});
