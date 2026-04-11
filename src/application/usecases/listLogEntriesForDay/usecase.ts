import type { IsoDateTime, LogEntry } from "../../../domain/models";
import type { LogEntryRepository } from "../../ports";

function toDayRange(date: Date): { from: IsoDateTime; to: IsoDateTime } {
  const startOfLocalDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    0,
    0,
    0,
    0,
  );

  const endOfLocalDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );

  return {
    from: startOfLocalDay.toISOString(),
    to: endOfLocalDay.toISOString(),
  };
}

export function listLogEntriesForDayUseCase(repository: LogEntryRepository) {
  return async function listLogEntriesForDay(date: Date): Promise<LogEntry[]> {
    const { from, to } = toDayRange(date);
    return repository.listByDateRange(from, to);
  };
}
