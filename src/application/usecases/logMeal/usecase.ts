import type { Meal, MealType } from "../../../domain/models";
import { DomainError } from "../../../domain/errors";
import type { FoodItemRepository, LogEntryRepository } from "../../ports";

export function logMealUseCase(
  foodItemRepository: FoodItemRepository,
  logEntryRepository: LogEntryRepository,
) {
  return async function logMeal(
    meal: Meal,
    date: Date,
    mealType: MealType,
  ): Promise<void> {
    // Verify all food items in the meal exist
    for (const mealItem of meal.items) {
      const foodItem = await foodItemRepository.findById(mealItem.foodItemId);
      if (foodItem === null) {
        throw new DomainError(
          "INVALID_FOOD_ITEM_NAME",
          `Food item in meal no longer exists: ${mealItem.foodItemId}`,
        );
      }
    }

    // Create a log entry for each item in the meal
    const dateIso = date.toISOString().split("T")[0]; // Get just the date part
    for (const mealItem of meal.items) {
      const logEntry = {
        id: `log-${meal.id}-${mealItem.foodItemId}-${Date.now()}`,
        foodItemId: mealItem.foodItemId,
        consumedQuantity: mealItem.consumedQuantity,
        occurredAt: `${dateIso}T12:00:00Z` as const,
        mealType,
        mealLogId: meal.id,
      };
      await logEntryRepository.create(logEntry);
    }
  };
}
