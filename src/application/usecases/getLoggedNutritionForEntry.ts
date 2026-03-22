import type { LogEntry, NutritionTotals } from "../../domain/models";
import { DomainError } from "../../domain/errors";
import { calculateLoggedNutrition } from "../../domain/rules/nutrition";
import type { FoodItemRepository } from "../ports";

export function getLoggedNutritionForEntryUseCase(
  repository: FoodItemRepository,
) {
  return async function getLoggedNutritionForEntry(
    logEntry: LogEntry,
  ): Promise<NutritionTotals> {
    const foodItem = await repository.findById(logEntry.foodItemId);

    if (foodItem === null) {
      throw new DomainError(
        "INVALID_FOOD_ITEM_NAME",
        "Cannot calculate nutrition for a missing food item",
      );
    }

    return calculateLoggedNutrition(foodItem, logEntry);
  };
}
