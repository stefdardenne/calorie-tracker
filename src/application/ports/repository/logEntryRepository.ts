import type { IsoDateTime, LogEntry } from "../../../domain/models";

export interface LogEntryRepository {
  create(logEntry: LogEntry): Promise<void>;
  listByDateRange(from: IsoDateTime, to: IsoDateTime): Promise<LogEntry[]>;
  listByFoodItemId(foodItemId: string): Promise<LogEntry[]>;
}
