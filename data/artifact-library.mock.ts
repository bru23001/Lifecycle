import type {
  ArtifactLibraryData,
  ArtifactListItem,
} from "@/types/artifact-library.types";

const baseList: ArtifactListItem[] = [
  {
    id: "artifact-a-3-2",
    artifactCode: "A-3.2",
    name: "Evaluation & Scoring Matrix",
    phaseNumber: 3,
    phaseName: "Evaluation & Selection",
    templateId: "a-3-2",
    templateName: "A-3.2 Evaluation & Scoring Matrix",
    status: "in_progress",
    version: "v0.3",
    lastUpdatedLabel: "Updated 2h ago",
    href: "/projects/sip-001/artifacts/artifact-a-3-2",
  },
  {
    id: "artifact-a-3-1",
    artifactCode: "A-3.1",
    name: "Solution Options Analysis",
    phaseNumber: 3,
    phaseName: "Evaluation & Selection",
    templateId: "a-3-1",
    templateName: "A-3.1 Solution Options Analysis",
    status: "approved",
    version: "v1.0",
    lastUpdatedLabel: "Updated 1d ago",
    href: "/projects/sip-001/artifacts/artifact-a-3-1",
  },
  {
    id: "artifact-a-3-3",
    artifactCode: "A-3.3",
    name: "Recommended Solution",
    phaseNumber: 3,
    phaseName: "Evaluation & Selection",
    templateId: "a-3-3",
    templateName: "A-3.3 Recommended Solution",
    status: "draft",
    version: "v0.1",
    lastUpdatedLabel: "Updated 2d ago",
    href: "/projects/sip-001/artifacts/artifact-a-3-3",
  },
  {
    id: "artifact-a-2-2",
    artifactCode: "A-2.2",
    name: "Problem Definition",
    phaseNumber: 2,
    phaseName: "Problem Framing",
    templateId: "a-2-2",
    templateName: "A-2.2 Problem Definition",
    status: "approved",
    version: "v1.0",
    lastUpdatedLabel: "Updated 3d ago",
    href: "/projects/sip-001/artifacts/artifact-a-2-2",
  },
  {
    id: "artifact-a-4-1",
    artifactCode: "A-4.1",
    name: "Business Case",
    phaseNumber: 4,
    phaseName: "Feasibility & Business Case",
    templateId: "a-4-1",
    templateName: "A-4.1 Business Case",
    status: "not_started",
    version: "v0.0",
    lastUpdatedLabel: "Updated -",
    href: "/projects/sip-001/artifacts/artifact-a-4-1",
  },
];

export const artifactLibraryMock: ArtifactLibraryData = {
  user: {
    name: "Alex Developer",
    role: "Solution Architect",
    initials: "AD",
  },
  project: {
    id: "sip-001",
    code: "SIP-001",
    name: "Secure Identity Platform",
  },
  artifactListItems: baseList,
  selectedArtifact: {
    detail: {
      id: "artifact-a-3-2",
      artifactCode: "A-3.2",
      name: "Evaluation & Scoring Matrix",
      description:
        "Score and compare solution options using weighted evaluation criteria.",
      projectId: "sip-001",
      projectName: "Secure Identity Platform",
      phaseNumber: 3,
      phaseName: "Evaluation & Selection",
      templateId: "a-3-2",
      templateName: "A-3.2 Evaluation & Scoring Matrix",
      ownerName: "Alex Developer",
      status: "in_progress",
      version: "v0.3",
      artifactVersionLabel: "v0.3 (Draft)",
      lastUpdatedLabel: "May 12, 2024 10:12 AM",
      createdOnLabel: "May 10, 2024 09:15 AM",
      isStarred: false,
    },
    markdownView: {
      artifactId: "artifact-a-3-2",
      title: "A-3.2 Evaluation & Scoring Matrix",
      markdown: `# A-3.2 Evaluation & Scoring Matrix

Phase 3: Evaluation & Selection
Secure Identity Platform (SIP-001)

## 1. Purpose
This artifact documents the evaluation and scoring of solution options against established criteria.

## 2. Evaluation Criteria
| # | Criterion | Weight (%) | Description |
|---|-----------|------------|-------------|
| 1 | Functional Fit | 30 | How well the solution meets functional requirements. |
| 2 | Technical Feasibility | 25 | Technical viability and implementation complexity. |
| 3 | Cost | 20 | Total cost of ownership and budget impact. |
| 4 | Vendor Capability | 15 | Vendor experience, stability, and support. |
| 5 | Scalability | 10 | Ability to scale with future needs. |

## 3. Solution Options Evaluated
- Option A - Okta IAM
- Option B - Azure AD
- Option C - Ping Identity`,
      generatedAtLabel: "Generated May 12, 2024 10:12 AM",
      hasMissingPlaceholders: false,
    },
    jsonEvidence: {
      artifactId: "artifact-a-3-2",
      projectId: "sip-001",
      phaseId: "phase-3",
      phaseNumber: 3,
      templateId: "a-3-2",
      templateCode: "A-3.2",
      templateVersion: "v1.2",
      artifactVersion: "v0.3",
      status: "in_progress",
      generatedAt: "2024-05-12T10:12:00.000Z",
      generatedBy: "Alex Developer",
      sections: [
        {
          sectionId: "purpose",
          title: "Purpose",
          status: "complete",
          values: {
            summary:
              "Document scoring and compare solution options against evaluation criteria.",
          },
        },
        {
          sectionId: "criteria",
          title: "Evaluation Criteria",
          status: "complete",
          values: {
            criteriaCount: 5,
            weighted: true,
          },
        },
      ],
      validation: {
        completionPercent: 60,
        exportReady: true,
        issues: [{ id: "warn-1", severity: "warning", message: "Two fields still contain draft notes." }],
      },
      evidenceLinks: [
        { evidenceId: "ev-002", linkedToSectionId: "criteria" },
        { evidenceId: "ev-003", linkedToSectionId: "criteria", linkedToFieldName: "cost" },
      ],
    },
    versionHistory: [
      {
        id: "version-v0-3",
        version: "v0.3",
        status: "draft",
        createdBy: "Alex Developer",
        createdOnLabel: "May 12, 2024 10:12 AM",
        changeSummary: "Updated scoring matrix and added cost evidence link.",
        canRestore: false,
      },
      {
        id: "version-v0-2",
        version: "v0.2",
        status: "draft",
        createdBy: "Alex Developer",
        createdOnLabel: "May 11, 2024 3:41 PM",
        changeSummary: "Added evaluation criteria and solution options.",
        canRestore: true,
      },
      {
        id: "version-v0-1",
        version: "v0.1",
        status: "draft",
        createdBy: "Alex Developer",
        createdOnLabel: "May 10, 2024 9:18 AM",
        changeSummary: "Initial artifact draft created from template.",
        canRestore: true,
      },
    ],
    linkedPhase: {
      phaseId: "phase-3",
      phaseNumber: 3,
      totalPhases: 14,
      phaseName: "Evaluation & Selection",
      status: "in_progress",
      workspaceHref: "/projects/sip-001/workspace?phase=3",
    },
    linkedGate: {
      gateId: "g2",
      gateCode: "G2",
      gateName: "Feasibility Approval",
      status: "pending_decision",
      reviewHref: "/projects/sip-001/gates/g2/review",
    },
    quickInfo: {
      artifactType: "Template Output",
      templateVersion: "v1.2",
      artifactVersion: "v0.3 (Draft)",
      status: "In Progress",
      overallProgressPercent: 60,
      requiredSections: 7,
      completedSections: 4,
      evidenceItems: 3,
      wordCount: 1842,
      lastUpdatedBy: "Alex Developer",
    },
    exportPackage: {
      artifactId: "artifact-a-3-2",
      canExportMarkdown: true,
      canExportJsonEvidence: true,
      canExportFullPackage: true,
      markdownFilename: "A-3.2_Evaluation-Scoring-Matrix.md",
      jsonFilename: "A-3.2_Evaluation-Scoring-Matrix.evidence.json",
      packageFilename: "A-3.2_Evaluation-Scoring-Matrix.package.zip",
      blockers: [],
    },
    activityLog: [
      {
        id: "act-1",
        actor: "Alex Developer",
        action: "Updated scoring table and evidence links",
        timestampLabel: "May 12, 2024 10:12 AM",
      },
      {
        id: "act-2",
        actor: "Alex Developer",
        action: "Created version v0.2",
        timestampLabel: "May 11, 2024 3:41 PM",
      },
    ],
    comments: [
      {
        id: "c-1",
        author: "Morgan Avery",
        body: "Please add stronger mitigation rationale in section 4.",
        createdOnLabel: "May 12, 2024 11:30 AM",
      },
      {
        id: "c-2",
        author: "Jordan Blake",
        body: "Cost assumptions look good for initial feasibility.",
        createdOnLabel: "May 12, 2024 12:05 PM",
      },
    ],
  },
};

export function buildArtifactLibraryMock(
  projectId: string,
  selectedArtifactId?: string,
): ArtifactLibraryData {
  const data = JSON.parse(JSON.stringify(artifactLibraryMock)) as ArtifactLibraryData;
  data.project.id = projectId;
  data.selectedArtifact.detail.projectId = projectId;
  data.selectedArtifact.markdownView.artifactId = selectedArtifactId ?? data.selectedArtifact.markdownView.artifactId;
  data.selectedArtifact.jsonEvidence.projectId = projectId;
  data.selectedArtifact.linkedPhase.workspaceHref = `/projects/${projectId}/workspace?phase=${data.selectedArtifact.linkedPhase.phaseNumber}`;
  data.selectedArtifact.linkedGate.reviewHref = `/projects/${projectId}/gates/${data.selectedArtifact.linkedGate.gateId}/review`;

  const selected =
    data.artifactListItems.find((item) => item.id === selectedArtifactId) ??
    data.artifactListItems[0];

  data.artifactListItems = data.artifactListItems.map((item) => ({
    ...item,
    href: `/projects/${projectId}/artifacts/${item.id}`,
  }));

  if (selected) {
    data.selectedArtifact.detail.id = selected.id;
    data.selectedArtifact.detail.artifactCode = selected.artifactCode;
    data.selectedArtifact.detail.name = selected.name;
    data.selectedArtifact.detail.phaseNumber = selected.phaseNumber;
    data.selectedArtifact.detail.phaseName = selected.phaseName;
    data.selectedArtifact.detail.templateId = selected.templateId;
    data.selectedArtifact.detail.templateName = selected.templateName;
    data.selectedArtifact.detail.status = selected.status;
    data.selectedArtifact.detail.version = selected.version;
    data.selectedArtifact.detail.artifactVersionLabel = `${selected.version} (${selected.status === "approved" ? "Approved" : "Draft"})`;
  }

  return data;
}
