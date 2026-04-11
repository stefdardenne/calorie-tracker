import { describe, expect, it, vi } from "vitest";

import type { FoodItem } from "../../../domain/models";
import { DomainError } from "../../../domain/errors";
import type { FoodItemRepository } from "../../ports";
import { createFoodItemUseCase } from "./usecase";

const chickenPer100g: FoodItem = {
  id: "food-1",
  name: "Chicken Breast",
  unit: "g",
  baseQuantity: 100,
  carbohydrates: 0,
  proteins: 31,
  fats: 3.6,
};

describe("createFoodItemUseCase", () => {
  it("creates a valid food item", async () => {
    const repository: FoodItemRepository = {
      create: vi.fn(async () => undefined),
      findById: vi.fn(),
      listAll: vi.fn(),
    };

    const createFoodItem = createFoodItemUseCase(repository);

    await createFoodItem(chickenPer100g);

    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith(chickenPer100g);
  });

  it("throws for invalid food item and does not persist", async () => {
    const repository: FoodItemRepository = {
      create: vi.fn(async () => undefined),
      findById: vi.fn(),
      listAll: vi.fn(),
    };

    const createFoodItem = createFoodItemUseCase(repository);

    const invalidFoodItem: FoodItem = {
      ...chickenPer100g,
      name: "",
    };

    await expect(createFoodItem(invalidFoodItem)).rejects.toThrow(DomainError);
    await expect(createFoodItem(invalidFoodItem)).rejects.toMatchObject({
      code: "INVALID_FOOD_ITEM_NAME",
    });
    expect(repository.create).not.toHaveBeenCalled();
  });
});
