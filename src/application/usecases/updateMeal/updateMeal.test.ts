import { describe, expect, it } from "vitest";

import { DomainError } from "../../../domain/errors";
import type { Meal } from "../../../domain/models/meal";
import { createMockMealRepository } from "../testHelpers/createMockMealRepository";
import { updateMealUseCase } from "./usecase";

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

describe("updateMealUseCase", () => {
  it("updates a valid meal", async () => {
    const repository = createMockMealRepository();
    const updateMeal = updateMealUseCase(repository);

    await updateMeal(sampleMeal);

    expect(repository.update).toHaveBeenCalledTimes(1);
    expect(repository.update).toHaveBeenCalledWith(sampleMeal);
  });

  it("throws when meal has no name", async () => {
    const repository = createMockMealRepository();
    const updateMeal = updateMealUseCase(repository);

    await expect(
      updateMeal({
        ...sampleMeal,
        name: "",
      }),
    ).rejects.toThrow(DomainError);
    expect(repository.update).not.toHaveBeenCalled();
  });
});
