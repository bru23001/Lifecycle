import type { AnyLifecycleTemplate } from "./types";
import { ideaCaptureTemplate } from "./A-0-idea";
import { problemDefinitionTemplate } from "./A-0.1-problem";
import { projectSelectionScorecardTemplate } from "./A-3.1-selection";
import { feasibilityAssessmentTemplate } from "./A-3.2-feasibility";
import { businessCaseTemplate } from "./A-3.3-business-case";
import { businessFieldReportTemplate } from "./A-4-business-field";
import { crsTemplate } from "./A-1-crs";
import { srsTemplate } from "./A-2-srs";
import { nfrRegisterTemplate } from "./A-10-nfr";
import { featureInventoryTemplate } from "./A-9-features";
import { requirementsPackageTemplate } from "./A-8-req-package";
import { stakeholderTemplate } from "./A-7-stakeholder";
import { scopeTemplate } from "./A-6-scope";
import { developmentPlanTemplate } from "./A-15-dev-plan";
import { ardTemplate } from "./ARD-001-architecture";
import { erdTemplate } from "./A-11-erd";
import { apiContractTemplate } from "./A-12-api-contract";
import { uxdTemplate } from "./UXD-001-uiux";
import { modulePlanTemplate } from "./A-13-module-plan";
import { envStrategyTemplate } from "./A-14-env-strategy";
import {
  milestoneNotesPhase10,
  milestoneNotesPhase11,
  milestoneNotesPhase12,
} from "./M-milestone-notes";
import {
  a16TestStrategyTemplate,
  a17AcceptanceScenariosTemplate,
  a18QaResultsTemplate,
  a19BugReportsTemplate,
  a20ValidationSignoffTemplate,
} from "./A-16-through-A-20-g7";
import {
  a21ReleaseReadinessTemplate,
  a27DeploymentChecklistTemplate,
  a38PostReleaseReviewTemplate,
} from "./A-21-A-27-A-38-late-gates";
import {
  a22ReleaseNotesTemplate,
  a23RollbackPlanTemplate,
  a24CommunicationsPlanTemplate,
  a25OperationalReadinessTemplate,
  a26SignoffRecordTemplate,
  a28DeploymentRunbookTemplate,
  a29SmokeTestResultsTemplate,
  a30MonitoringCutoverTemplate,
  a31HypercarePlanTemplate,
  a35IncidentReviewTemplate,
  a39KbUpdateTemplate,
  a40CapacityReportTemplate,
  a41ImprovementBacklogTemplate,
} from "./late-gate-suite-expanded";

export const templateRegistry = {
  "A-0": ideaCaptureTemplate,
  "A-0.1": problemDefinitionTemplate,
  "A-3.1": projectSelectionScorecardTemplate,
  "A-3.2": feasibilityAssessmentTemplate,
  "A-3.3": businessCaseTemplate,
  "A-4": businessFieldReportTemplate,
  "A-7": stakeholderTemplate,
  "A-10": nfrRegisterTemplate,
  "A-1": crsTemplate,
  "A-2": srsTemplate,
  "A-9": featureInventoryTemplate,
  "A-8": requirementsPackageTemplate,
  "A-6": scopeTemplate,
  "A-15": developmentPlanTemplate,
  "ARD-001": ardTemplate,
  "A-11": erdTemplate,
  "A-12": apiContractTemplate,
  "UXD-001": uxdTemplate,
  "A-13": modulePlanTemplate,
  "A-14": envStrategyTemplate,
  "M-10": milestoneNotesPhase10,
  "M-11": milestoneNotesPhase11,
  "M-12": milestoneNotesPhase12,
  "A-16": a16TestStrategyTemplate,
  "A-17": a17AcceptanceScenariosTemplate,
  "A-18": a18QaResultsTemplate,
  "A-19": a19BugReportsTemplate,
  "A-20": a20ValidationSignoffTemplate,
  "A-21": a21ReleaseReadinessTemplate,
  "A-22": a22ReleaseNotesTemplate,
  "A-23": a23RollbackPlanTemplate,
  "A-24": a24CommunicationsPlanTemplate,
  "A-25": a25OperationalReadinessTemplate,
  "A-26": a26SignoffRecordTemplate,
  "A-27": a27DeploymentChecklistTemplate,
  "A-28": a28DeploymentRunbookTemplate,
  "A-29": a29SmokeTestResultsTemplate,
  "A-30": a30MonitoringCutoverTemplate,
  "A-31": a31HypercarePlanTemplate,
  "A-35": a35IncidentReviewTemplate,
  "A-38": a38PostReleaseReviewTemplate,
  "A-39": a39KbUpdateTemplate,
  "A-40": a40CapacityReportTemplate,
  "A-41": a41ImprovementBacklogTemplate,
} as Record<string, AnyLifecycleTemplate>;

export type TemplateId = keyof typeof templateRegistry;

export function getTemplate(templateId: string): AnyLifecycleTemplate {
  const template = templateRegistry[templateId as TemplateId];

  if (!template) {
    throw new Error(`Unknown template id: ${templateId}`);
  }

  return template;
}

export function hasTemplate(templateId: string): templateId is TemplateId {
  return templateId in templateRegistry;
}

export function getAllTemplates(): AnyLifecycleTemplate[] {
  return Object.values(templateRegistry);
}

export function getTemplatesForPhase(phase: number): AnyLifecycleTemplate[] {
  return getAllTemplates().filter((template) => template.phase === phase);
}

export function getTemplatesForGate(
  gateId: import("./types").LifecycleGateId,
): AnyLifecycleTemplate[] {
  return getAllTemplates().filter((template) => template.gate === gateId);
}

export function getTemplateIds(): TemplateId[] {
  return Object.keys(templateRegistry) as TemplateId[];
}

export function assertTemplateId(templateId: string): asserts templateId is TemplateId {
  if (!hasTemplate(templateId)) {
    throw new Error(`Unknown template id: ${templateId}`);
  }
}
