export type GateSubmissionState = {
  gateCode: string;
  gateName: string;
  canSubmit: boolean;
  missingRequirements: string[];
  submitHref: string;
};
