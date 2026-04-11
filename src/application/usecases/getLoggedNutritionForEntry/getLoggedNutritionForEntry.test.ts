import { describe, expect, it, vi } from "vitest";

import type { FoodItem, LogEntry } from "../../../domain/models";
import { DomainError } from "../../../domain/errors";
import { createMockFoodItemRepository } from "../testHelpers/createMockFoodItemRepository";
import { getLoggedNutritionForEntryUseCase } from "./usecase";

const chickenPer100g: FoodItem = {
  id: "food-1",
  name: "Chicken Breast",
  unit: "g",
  baseQuantity: 100,
  carbohydrates: 0,
  proteins: 31,
  fats: 3.6,
};

const validLogEntry: LogEntry = {
  id: "log-1",
  foodItemId: "food-1",
  consumedQuantity: 150,
  occurredAt: "2026-03-22T12:00:00.000Z",
};

describe("getLoggedNutritionForEntryUseCase", () => {
  it("returns calculated nutrition when the food item exists", async () => {
    const repository = createMockFoodItemRepository({
      findById: vi.fn(async () => chickenPer100g),
      listAll: vi.fn(async () => [chickenPer100g]),
    });

    const getLoggedNutritionForEntry =
      getLoggedNutritionForEntryUseCase(repository);

    const result = await getLoggedNutritionForEntry(validLogEntry);

    expect(result.carbohydrates).toBe(0);
    expect(result.proteins).toBe(46.5);
    expect(result.fats).toBe(5.4);
    expect(result.calories).toBe(234.6);
  });

  it("throws when the linked food item does not exist", async () => {
    const repository = createMockFoodItemRepository();

    const getLoggedNutritionForEntry =
      getLoggedNutritionForEntryUseCase(repository);

    await expect(getLoggedNutritionForEntry(validLogEntry)).rejects.toThrow(
      DomainError,
    );
  });
});
