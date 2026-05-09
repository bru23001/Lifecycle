-- Remap legacy domain phases (1–9) to workspace milestone indices (1–14).
-- See lib/workspacePhases.ts — Project.currentPhase is now aligned with WORKSPACE_PHASES index.
UPDATE Project SET currentPhase = CASE currentPhase
  WHEN 1 THEN 1
  WHEN 2 THEN 2
  WHEN 3 THEN 3
  WHEN 4 THEN 4
  WHEN 5 THEN 6
  WHEN 6 THEN 7
  WHEN 7 THEN 8
  WHEN 8 THEN 9
  WHEN 9 THEN 11
  ELSE currentPhase
END
WHERE currentPhase >= 1 AND currentPhase <= 9;
