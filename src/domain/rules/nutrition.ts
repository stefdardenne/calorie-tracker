import type { FoodItem, LogEntry, Macros, NutritionTotals } from "../models";

export function scaleMacros(
  foodItem: FoodItem,
  consumedQuantity: number,
): Macros {
  if (foodItem.baseQuantity <= 0) {
    throw new Error("Food item baseQuantity must be greater than 0");
  }

  if (consumedQuantity <= 0) {
    throw new Error("Consumed quantity must be greater than 0");
  }

  const factor = consumedQuantity / foodItem.baseQuantity;

  return {
    carbohydrates: foodItem.carbohydrates * factor,
    proteins: foodItem.proteins * factor,
    fats: foodItem.fats * factor,
  };
}

export function calculateCaloriesFromMacros(macros: Macros): number {
  if (macros.carbohydrates < 0 || macros.proteins < 0 || macros.fats < 0) {
    throw new Error("Macro values cannot be negative");
  }

  return macros.carbohydrates * 4 + macros.proteins * 4 + macros.fats * 9;
}

export function calculateLoggedNutrition(
  foodItem: FoodItem,
  logEntry: LogEntry,
): NutritionTotals {
  if (foodItem.id !== logEntry.foodItemId) {
    throw new Error(
      "Log entry foodItemId does not match the provided food item",
    );
  }

  const macros = scaleMacros(foodItem, logEntry.consumedQuantity);

  return {
    ...macros,
    calories: calculateCaloriesFromMacros(macros),
  };
}
