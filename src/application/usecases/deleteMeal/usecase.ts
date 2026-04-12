import type { MealRepository } from "../../ports";

export function deleteMealUseCase(repository: MealRepository) {
  return async function deleteMeal(id: string): Promise<void> {
    await repository.delete(id);
  };
}
