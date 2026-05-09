export type RequiredTemplateStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "changes_requested";

export type RequiredTemplate = {
  id: string;
  templateCode: string;
  name: string;
  description: string;
  status: RequiredTemplateStatus;
  progressPercent: number;
  lastUpdatedLabel?: string;
  href: string;
};

export const EXAMPLE_REQUIRED_TEMPLATES: RequiredTemplate[] = [
  {
    id: "a-3-1",
    templateCode: "A-3.1",
    name: "Solution Options Analysis",
    description: "Identify and analyze potential solution options against key criteria.",
    status: "completed",
    progressPercent: 100,
    lastUpdatedLabel: "May 12, 2024 · 2h ago",
    href: "/projects/sip-001/artifacts/a-3-1",
  },
  {
    id: "a-3-2",
    templateCode: "A-3.2",
    name: "Evaluation & Scoring Matrix",
    description: "Score and compare options using weighted evaluation criteria.",
    status: "in_progress",
    progressPercent: 60,
    lastUpdatedLabel: "May 12, 2024 · 1h ago",
    href: "/projects/sip-001/artifacts/a-3-2",
  },
  {
    id: "a-3-3",
    templateCode: "A-3.3",
    name: "Recommended Solution",
    description: "Document the recommended solution and justification.",
    status: "not_started",
    progressPercent: 0,
    href: "/projects/sip-001/artifacts/a-3-3",
  },
];
