import type { Meal } from "../../../domain/models/meal";
import { assertValidMeal } from "../../../domain/rules/validation";
import type { MealRepository } from "../../ports";

export function createMealUseCase(repository: MealRepository) {
  return async function createMeal(meal: Meal): Promise<void> {
    assertValidMeal(meal);
    await repository.create(meal);
  };
}
