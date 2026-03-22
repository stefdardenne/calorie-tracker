const ISO_8601_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;

export function isValidIsoDateTime(value: string): boolean {
  return ISO_8601_REGEX.test(value) && !Number.isNaN(Date.parse(value));
}
