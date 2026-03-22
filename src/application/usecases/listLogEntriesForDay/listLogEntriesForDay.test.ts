import { describe, expect, it, vi } from "vitest";

import type { LogEntry } from "../../../domain/models";
import type { LogEntryRepository } from "../../ports";
import { listLogEntriesForDayUseCase } from "./index";

const validLogEntry: LogEntry = {
  id: "log-1",
  foodItemId: "food-1",
  consumedQuantity: 150,
  occurredAt: "2026-03-22T12:00:00.000Z",
};

describe("listLogEntriesForDayUseCase", () => {
  it("requests entries for the full local day converted to UTC", async () => {
    const entries: LogEntry[] = [validLogEntry];
    const repository: LogEntryRepository = {
      create: vi.fn(async () => undefined),
      listByDateRange: vi.fn(async () => entries),
      listByFoodItemId: vi.fn(async () => []),
    };

    const listLogEntriesForDay = listLogEntriesForDayUseCase(repository);

    const date = new Date("2026-03-22T15:30:00.000Z");
    const result = await listLogEntriesForDay(date);

    const expectedFrom = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      0,
      0,
      0,
      0,
    ).toISOString();
    const expectedTo = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      23,
      59,
      59,
      999,
    ).toISOString();

    expect(repository.listByDateRange).toHaveBeenCalledWith(
      expectedFrom,
      expectedTo,
    );
    expect(result).toEqual(entries);
  });
});
