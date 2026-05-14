export type GlobalSearchResultType =
  | "project"
  | "workspace"
  | "artifact"
  | "evidence"
  | "approval"
  | "gate_decision"
  | "template"
  | "traceability"
  | "reports";

export type GlobalSearchResultItem = {
  id: string;
  type: GlobalSearchResultType;
  title: string;
  subtitle: string;
  href: string;
};

export type GlobalSearchResponse = {
  query: string;
  results: GlobalSearchResultItem[];
};
