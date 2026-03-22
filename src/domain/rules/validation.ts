import type { FoodItem, LogEntry, Macros } from "../models";
import { DomainError } from "../errors";
import { isValidIsoDateTime } from "./isoDateTimeValidator/isoDateTimeValidator";

export function assertValidFoodItem(foodItem: FoodItem): void {
  if (foodItem.name.trim().length === 0) {
    throw new DomainError(
      "INVALID_FOOD_ITEM_NAME",
      "Food item name is required",
    );
  }

  if (foodItem.baseQuantity <= 0) {
    throw new DomainError(
      "INVALID_BASE_QUANTITY",
      "Food item baseQuantity must be greater than 0",
    );
  }

  assertValidMacros(foodItem);
}

export function assertValidLogEntry(logEntry: LogEntry): void {
  if (logEntry.consumedQuantity <= 0) {
    throw new DomainError(
      "INVALID_CONSUMED_QUANTITY",
      "Consumed quantity must be greater than 0",
    );
  }

  if (!isValidIsoDateTime(logEntry.occurredAt)) {
    throw new DomainError(
      "INVALID_ISO_DATETIME",
      "occurredAt must be a valid ISO 8601 date-time string",
    );
  }
}

export function assertValidMacros(macros: Macros): void {
  if (macros.carbohydrates < 0 || macros.proteins < 0 || macros.fats < 0) {
    throw new DomainError(
      "INVALID_MACRO_VALUES",
      "Macro values cannot be negative",
    );
  }
}

export function assertPositiveQuantity(
  quantity: number,
  fieldName: string,
): void {
  if (quantity <= 0) {
    throw new DomainError(
      "INVALID_CONSUMED_QUANTITY",
      `${fieldName} must be greater than 0`,
    );
  }
}
