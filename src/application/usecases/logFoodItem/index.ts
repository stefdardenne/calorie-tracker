import type { LogEntry } from "../../../domain/models";
import { DomainError } from "../../../domain/errors";
import { assertValidLogEntry } from "../../../domain/rules/validation";
import type { FoodItemRepository, LogEntryRepository } from "../../ports";

export function logFoodItemUseCase(
  foodItemRepository: FoodItemRepository,
  logEntryRepository: LogEntryRepository,
) {
  return async function logFoodItem(logEntry: LogEntry): Promise<void> {
    assertValidLogEntry(logEntry);

    const foodItem = await foodItemRepository.findById(logEntry.foodItemId);

    if (foodItem === null) {
      throw new DomainError(
        "INVALID_FOOD_ITEM_NAME",
        "Cannot log entry for a food item that does not exist",
      );
    }

    await logEntryRepository.create(logEntry);
  };
}
