import { GateRequiredInputsFullPage } from "@/components/gate-review/gate-required-inputs-full-page";
import { loadGateReviewData } from "@/lib/server/gate-review";

export const dynamic = "force-dynamic";

export default async function GateRequiredInputsRoutePage({
  params,
}: {
  params: Promise<{ id: string; gateId: string }>;
}) {
  const { id, gateId } = await params;
  const data = await loadGateReviewData(id, gateId);
  return <GateRequiredInputsFullPage data={data} />;
}
