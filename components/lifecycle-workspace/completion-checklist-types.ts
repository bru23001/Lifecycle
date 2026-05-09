export type CompletionChecklistItem = {
  id: string;
  label: string;
  status: "complete" | "incomplete" | "blocked";
  required: boolean;
  href?: string;
};
