import { describe, expect, it } from "vitest";

import { createMockMealRepository } from "../testHelpers/createMockMealRepository";
import { deleteMealUseCase } from "./usecase";

describe("deleteMealUseCase", () => {
  it("deletes a meal from repository", async () => {
    const repository = createMockMealRepository();
    const deleteMeal = deleteMealUseCase(repository);

    await deleteMeal("meal-1");

    expect(repository.delete).toHaveBeenCalledWith("meal-1");
    expect(repository.delete).toHaveBeenCalledTimes(1);
  });
});
