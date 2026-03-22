import type { FoodItem } from "../../domain/models";
import { assertValidFoodItem } from "../../domain/rules/validation";
import type { FoodItemRepository } from "../ports";

export function createFoodItemUseCase(repository: FoodItemRepository) {
  return async function createFoodItem(foodItem: FoodItem): Promise<void> {
    assertValidFoodItem(foodItem);
    await repository.create(foodItem);
  };
}
