function formatValue(value: unknown): string {
    if (value === null || value === undefined || value === "") {
      return "_Not provided_";
    }
  
    if (Array.isArray(value)) {
      if (value.length === 0) return "_None_";
      return value.map((item) => `- ${String(item)}`).join("\n");
    }
  
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
  
    return String(value);
  }
  
  export function renderTemplateMarkdown(args: {
    templateId: string;
    title: string;
    sections: {
      id: string;
      title: string;
      fields: {
        name: string;
        label: string;
      }[];
    }[];
    data: Record<string, unknown>;
  }): string {
    const body = args.sections
      .map((section) => {
        const fields = section.fields
          .map((field) => {
            const value = formatValue(args.data[field.name]);
  
            return `### ${field.label}
  
  ${value}`;
          })
          .join("\n\n");
  
        return `## ${section.id}. ${section.title}
  
  ${fields}`;
      })
      .join("\n\n---\n\n");
  
    return `# ${args.title}
  
  ${body}
  `;
  }