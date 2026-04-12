import type { Meal } from "../../../domain/models/meal";
import { assertValidMeal } from "../../../domain/rules/validation";
import type { MealRepository } from "../../ports";

export function updateMealUseCase(repository: MealRepository) {
  return async function updateMeal(meal: Meal): Promise<void> {
    assertValidMeal(meal);
    await repository.update(meal);
  };
}
