import type { LogEntryRepository } from "../../ports";

export function deleteLogEntryUseCase(logEntryRepository: LogEntryRepository) {
  return async function deleteLogEntry(id: string): Promise<void> {
    await logEntryRepository.delete(id);
  };
}
