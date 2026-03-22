import { describe, expect, it } from "vitest";

import { isValidIsoDateTime } from "./isoDateTimeValidator";

describe("isValidIsoDateTime", () => {
  it("validates correct ISO 8601 format with milliseconds", () => {
    expect(isValidIsoDateTime("2026-03-22T12:30:45.123Z")).toBe(true);
  });

  it("validates correct ISO 8601 format without milliseconds", () => {
    expect(isValidIsoDateTime("2026-03-22T12:30:45Z")).toBe(true);
  });

  it("rejects missing 'Z' timezone indicator", () => {
    expect(isValidIsoDateTime("2026-03-22T12:30:45.123")).toBe(false);
  });

  it("rejects incorrect date separator", () => {
    expect(isValidIsoDateTime("2026/03/22T12:30:45.123Z")).toBe(false);
  });

  it("rejects incorrect time separator", () => {
    expect(isValidIsoDateTime("2026-03-22T12-30-45.123Z")).toBe(false);
  });

  it("rejects invalid month", () => {
    expect(isValidIsoDateTime("2026-13-22T12:30:45.123Z")).toBe(false);
  });

  it("rejects invalid day", () => {
    expect(isValidIsoDateTime("2026-03-32T12:30:45.123Z")).toBe(false);
  });

  it("rejects invalid hour", () => {
    expect(isValidIsoDateTime("2026-03-22T25:30:45.123Z")).toBe(false);
  });

  it("rejects invalid minute", () => {
    expect(isValidIsoDateTime("2026-03-22T12:60:45.123Z")).toBe(false);
  });

  it("rejects invalid second", () => {
    expect(isValidIsoDateTime("2026-03-22T12:30:60.123Z")).toBe(false);
  });

  it("rejects missing components", () => {
    expect(isValidIsoDateTime("2026-03-22T12:30Z")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidIsoDateTime("")).toBe(false);
  });

  it("rejects non-ISO date format", () => {
    expect(isValidIsoDateTime("03/22/2026 12:30:45")).toBe(false);
  });

  it("rejects timezone offset instead of Z", () => {
    expect(isValidIsoDateTime("2026-03-22T12:30:45.123+00:00")).toBe(false);
  });
});
