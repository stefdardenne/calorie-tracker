import { describe, expect, it, vi } from "vitest";

import type { Meal } from "../../../domain/models/meal";
import { createMockMealRepository } from "../testHelpers/createMockMealRepository";
import { listMealsUseCase } from "./usecase";

const sampleMeal: Meal = {
  id: "meal-1",
  name: "Lunch",
  createdAt: "2026-04-12T12:00:00.000Z",
  items: [
    {
      foodItemId: "food-1",
      consumedQuantity: 150,
    },
  ],
};

describe("listMealsUseCase", () => {
  it("returns all saved meals", async () => {
    const repository = createMockMealRepository({
      listAll: vi.fn(async () => [sampleMeal]),
    });
    const listMeals = listMealsUseCase(repository);

    const result = await listMeals();

    expect(repository.listAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual([sampleMeal]);
  });
});
