import type { FoodItemRepository } from "../../ports";

export function deleteFoodItemUseCase(repository: FoodItemRepository) {
  return async function deleteFoodItem(id: string): Promise<void> {
    await repository.delete(id);
  };
}
