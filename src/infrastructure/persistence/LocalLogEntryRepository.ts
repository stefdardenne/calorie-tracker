import type { IsoDateTime, LogEntry } from "../../domain/models";
import type { LogEntryRepository } from "../../application/ports";

const STORAGE_KEY_PREFIX = "log:";

export class LocalLogEntryRepository implements LogEntryRepository {
  async create(logEntry: LogEntry): Promise<void> {
    const key = `${STORAGE_KEY_PREFIX}${logEntry.id}`;
    localStorage.setItem(key, JSON.stringify(logEntry));
  }

  async listByDateRange(
    from: IsoDateTime,
    to: IsoDateTime,
  ): Promise<LogEntry[]> {
    const entries: LogEntry[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEY_PREFIX)) {
        const stored = localStorage.getItem(key);
        if (stored !== null) {
          const entry = JSON.parse(stored) as LogEntry;
          if (entry.occurredAt >= from && entry.occurredAt <= to) {
            entries.push(entry);
          }
        }
      }
    }
    return entries;
  }

  async listByFoodItemId(foodItemId: string): Promise<LogEntry[]> {
    const entries: LogEntry[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEY_PREFIX)) {
        const stored = localStorage.getItem(key);
        if (stored !== null) {
          const entry = JSON.parse(stored) as LogEntry;
          if (entry.foodItemId === foodItemId) {
            entries.push(entry);
          }
        }
      }
    }
    return entries;
  }
}
