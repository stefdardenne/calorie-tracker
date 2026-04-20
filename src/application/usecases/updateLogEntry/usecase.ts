import type { LogEntry } from "../../../domain/models";
import { assertValidLogEntry } from "../../../domain/rules/validation";
import type { LogEntryRepository } from "../../ports";

export function updateLogEntryUseCase(logEntryRepository: LogEntryRepository) {
  return async function updateLogEntry(logEntry: LogEntry): Promise<void> {
    assertValidLogEntry(logEntry);
    await logEntryRepository.update(logEntry);
  };
}
