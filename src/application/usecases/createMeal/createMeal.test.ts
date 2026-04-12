import { describe, expect, it } from "vitest";

import { DomainError } from "../../../domain/errors";
import type { Meal } from "../../../domain/models/meal";
import { createMockMealRepository } from "../testHelpers/createMockMealRepository";
import { createMealUseCase } from "./usecase";

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

describe("createMealUseCase", () => {
  it("creates a valid meal", async () => {
    const repository = createMockMealRepository();
    const createMeal = createMealUseCase(repository);

    await createMeal(sampleMeal);

    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith(sampleMeal);
  });

  it("throws when meal has no name", async () => {
    const repository = createMockMealRepository();
    const createMeal = createMealUseCase(repository);

    await expect(
      createMeal({
        ...sampleMeal,
        name: "",
      }),
    ).rejects.toThrow(DomainError);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it("throws when meal has no items", async () => {
    const repository = createMockMealRepository();
    const createMeal = createMealUseCase(repository);

    await expect(
      createMeal({
        ...sampleMeal,
        items: [],
      }),
    ).rejects.toThrow(DomainError);
    expect(repository.create).not.toHaveBeenCalled();
  });
});
