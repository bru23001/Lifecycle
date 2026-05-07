import { z } from "zod";

export type TemplateFieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "select"
  | "checkbox"
  | "tags";

export type TemplateFieldOption = {
  label: string;
  value: string;
};

export type TemplateField = {
  name: string;
  label: string;
  type: TemplateFieldType;
  required?: boolean;
  placeholder?: string;
  description?: string;
  options?: TemplateFieldOption[];
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

export type LifecycleTemplate<
  TSchema extends z.ZodObject<z.ZodRawShape>,
> = {
  templateId: string;
  title: string;
  phase: number;
  gate?: "G1" | "G2" | "G3";
  schema: TSchema;
  sections: TemplateSection[];
  toMarkdown: (data: z.infer<TSchema>) => string;
};

/** Registry-wide shape; `toMarkdown` is widened so heterogeneous templates type-check. */
export type AnyLifecycleTemplate = {
  templateId: string;
  title: string;
  phase: number;
  gate?: "G1" | "G2" | "G3";
  schema: z.ZodObject<z.ZodRawShape>;
  sections: TemplateSection[];
  toMarkdown: (data: unknown) => string;
};