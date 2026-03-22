import type { FoodItem, LogEntry, Macros, NutritionTotals } from "../models";
import { DomainError } from "../errors";
import {
  assertPositiveQuantity,
  assertValidFoodItem,
  assertValidMacros,
} from "./validation";

export function scaleMacros(
  foodItem: FoodItem,
  consumedQuantity: number,
): Macros {
  assertValidFoodItem(foodItem);
  assertPositiveQuantity(consumedQuantity, "Consumed quantity");

  const factor = consumedQuantity / foodItem.baseQuantity;

  return {
    carbohydrates: foodItem.carbohydrates * factor,
    proteins: foodItem.proteins * factor,
    fats: foodItem.fats * factor,
  };
}

export function calculateCaloriesFromMacros(macros: Macros): number {
  assertValidMacros(macros);

  return macros.carbohydrates * 4 + macros.proteins * 4 + macros.fats * 9;
}

export function calculateLoggedNutrition(
  foodItem: FoodItem,
  logEntry: LogEntry,
): NutritionTotals {
  if (foodItem.id !== logEntry.foodItemId) {
    throw new DomainError(
      "FOOD_ITEM_ID_MISMATCH",
      "Log entry foodItemId does not match the provided food item",
    );
  }

  const macros = scaleMacros(foodItem, logEntry.consumedQuantity);

  return {
    ...macros,
    calories: calculateCaloriesFromMacros(macros),
  };
}
