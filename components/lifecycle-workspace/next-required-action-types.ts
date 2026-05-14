export type NextRequiredAction = {
  label: string;
  description: string;
  ctaLabel: string;
  href: string;
  /** Optional second CTA (e.g. open workspace at current phase). */
  secondaryHref?: string;
  secondaryLabel?: string;
};
