export type EvidenceAttachmentType =
  | "pdf"
  | "spreadsheet"
  | "document"
  | "image"
  | "link"
  | "json"
  | "markdown";

export type EvidenceAttachment = {
  id: string;
  name: string;
  type: EvidenceAttachmentType;
  linkedTo: string[];
  addedBy: string;
  addedOnLabel: string;
  href: string;
};
