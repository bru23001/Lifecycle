/**
 * Shared types for release automation scripts (no runtime imports from DB modules).
 */
export type PreReleaseStep = {
  name: string;
  ok: boolean;
  durationMs: number;
  error?: string;
};
