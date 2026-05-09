import { z } from "zod";

export type TemplateFieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "checkbox"
  | "tags"
  | "repeater"
  | "refPicker";

export type TemplateFieldOption = {
  label: string;
  value: string;
};

/** Fields allowed inside a repeater row (no nested repeater in MVP). */
export type RepeaterRowFieldType = Exclude<
  TemplateFieldType,
  "repeater" | "refPicker"
>;

export type RepeaterRowField = {
  name: string;
  label: string;
  type: RepeaterRowFieldType;
  required?: boolean;
  placeholder?: string;
  description?: string;
  options?: TemplateFieldOption[];
};

export type TemplateRefPickerTarget = "requirement" | "feature";

export type TemplateField =
  | {
      name: string;
      label: string;
      type: Exclude<TemplateFieldType, "repeater" | "refPicker">;
      required?: boolean;
      placeholder?: string;
      description?: string;
      options?: TemplateFieldOption[];
    }
  | {
      type: "repeater";
      name: string;
      label: string;
      description?: string;
      required?: boolean;
      minRows?: number;
      rowFields: RepeaterRowField[];
    }
  | {
      type: "refPicker";
      name: string;
      label: string;
      description?: string;
      required?: boolean;
      /** Load options from DB when saving under a project */
      refTarget: TemplateRefPickerTarget;
      /** For requirements: filter by kind (CRS, SRS_FR, SRS_NFR, NFR) */
      requirementKinds?: string[];
      multi?: boolean;
      placeholder?: string;
    };

export type TemplateSection = {
  id: string;
  title: string;
  description?: string;
  fields: TemplateField[];
};

export type MarkdownContext<TData> = {
  templateId: string;
  title: string;
  data: TData;
};

export type LifecycleGateId =
  | "G1"
  | "G2"
  | "G3"
  | "G4"
  | "G5"
  | "G6"
  | "G7"
  | "G8"
  | "G9"
  | "G10";

export type LifecycleTemplate<
  TSchema extends z.ZodObject<z.ZodRawShape>,
> = {
  templateId: string;
  title: string;
  phase: number;
  gate?: LifecycleGateId;
  /** Phase 7 templates gated by applicability toggles on Project */
  applicabilityKey?: "data" | "apis" | "ui";
  schema: TSchema;
  sections: TemplateSection[];
  toMarkdown: (data: z.infer<TSchema>) => string;
};

/** Registry-wide shape; `toMarkdown` is widened so heterogeneous templates type-check. */
export type AnyLifecycleTemplate = {
  templateId: string;
  title: string;
  phase: number;
  gate?: LifecycleGateId;
  applicabilityKey?: "data" | "apis" | "ui";
  schema: z.ZodObject<z.ZodRawShape>;
  sections: TemplateSection[];
  toMarkdown: (data: unknown) => string;
};
