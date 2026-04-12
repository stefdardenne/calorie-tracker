import type { Meal } from "../../../domain/models/meal";
import type { MealRepository } from "../../ports";

export function listMealsUseCase(repository: MealRepository) {
  return async function listMeals(): Promise<Meal[]> {
    return repository.listAll();
  };
}
