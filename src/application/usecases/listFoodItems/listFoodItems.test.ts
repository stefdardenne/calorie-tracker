import { describe, expect, it, vi } from "vitest";

import type { FoodItem } from "../../../domain/models";
import { createMockFoodItemRepository } from "../testHelpers/createMockFoodItemRepository";
import { listFoodItemsUseCase } from "./usecase";

const chickenPer100g: FoodItem = {
  id: "food-1",
  name: "Chicken Breast",
  unit: "g",
  baseQuantity: 100,
  carbohydrates: 0,
  proteins: 31,
  fats: 3.6,
};

describe("listFoodItemsUseCase", () => {
  it("returns all food items from repository", async () => {
    const repository = createMockFoodItemRepository({
      findById: vi.fn(async () => chickenPer100g),
      listAll: vi.fn(async () => [chickenPer100g]),
    });

    const listFoodItems = listFoodItemsUseCase(repository);

    const result = await listFoodItems();

    expect(repository.listAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual([chickenPer100g]);
  });
});
