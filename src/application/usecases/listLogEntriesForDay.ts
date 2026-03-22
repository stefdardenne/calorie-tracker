import type { IsoDateTime, LogEntry } from "../../domain/models";
import type { LogEntryRepository } from "../ports";

function toDayRange(date: Date): { from: IsoDateTime; to: IsoDateTime } {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return {
    from: `${year}-${month}-${day}T00:00:00.000Z`,
    to: `${year}-${month}-${day}T23:59:59.999Z`,
  };
}

export function listLogEntriesForDayUseCase(repository: LogEntryRepository) {
  return async function listLogEntriesForDay(date: Date): Promise<LogEntry[]> {
    const { from, to } = toDayRange(date);
    return repository.listByDateRange(from, to);
  };
}
