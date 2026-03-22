import type { LogEntry, NutritionTotals } from "../../domain/models";
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
      throw new Error("Cannot calculate nutrition for a missing food item");
    }

    return calculateLoggedNutrition(foodItem, logEntry);
  };
}
