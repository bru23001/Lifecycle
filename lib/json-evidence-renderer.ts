export function prettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

export function validateJson(value: string): { valid: boolean; message: string } {
  try {
    JSON.parse(value);
    return { valid: true, message: "JSON is valid." };
  } catch (error) {
    return {
      valid: false,
      message: error instanceof Error ? error.message : "Invalid JSON.",
    };
  }
}
