export type ValidationWarning = {
  id: string;
  message: string;
  severity: "info" | "warning" | "error";
  relatedObjectType:
    | "template"
    | "artifact"
    | "evidence"
    | "gate"
    | "traceability";
  relatedObjectId?: string;
  href?: string;
};
