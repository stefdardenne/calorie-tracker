import type { FoodItem } from "../../../domain/models";
import type { FoodItemRepository } from "../../ports";

export function listFoodItemsUseCase(repository: FoodItemRepository) {
  return async function listFoodItems(): Promise<FoodItem[]> {
    return repository.listAll();
  };
}
