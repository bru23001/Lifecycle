export function formatOverallAssessmentLabel(
  key: "meets_requirements" | "partially_meets_requirements" | "does_not_meet_requirements" | "not_reviewed",
): string {
  switch (key) {
    case "meets_requirements":
      return "Meets Requirements";
    case "partially_meets_requirements":
      return "Partially Meets Requirements";
    case "does_not_meet_requirements":
      return "Does Not Meet Requirements";
    case "not_reviewed":
      return "Not Reviewed";
    default:
      return "Not Reviewed";
  }
}
