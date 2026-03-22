import type { FoodItem, LogEntry, Macros } from "../models";

export function assertValidFoodItem(foodItem: FoodItem): void {
  if (foodItem.name.trim().length === 0) {
    throw new Error("Food item name is required");
  }

  if (foodItem.baseQuantity <= 0) {
    throw new Error("Food item baseQuantity must be greater than 0");
  }

  assertValidMacros(foodItem);
}

export function assertValidLogEntry(logEntry: LogEntry): void {
  if (logEntry.consumedQuantity <= 0) {
    throw new Error("Consumed quantity must be greater than 0");
  }

  if (Number.isNaN(Date.parse(logEntry.occurredAt))) {
    throw new Error("occurredAt must be a valid ISO date-time string");
  }
}

export function assertValidMacros(macros: Macros): void {
  if (macros.carbohydrates < 0 || macros.proteins < 0 || macros.fats < 0) {
    throw new Error("Macro values cannot be negative");
  }
}

export function assertPositiveQuantity(
  quantity: number,
  fieldName: string,
): void {
  if (quantity <= 0) {
    throw new Error(`${fieldName} must be greater than 0`);
  }
}
