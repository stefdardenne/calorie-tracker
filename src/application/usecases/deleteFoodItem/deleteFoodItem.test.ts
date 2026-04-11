import { describe, expect, it } from "vitest";

import { createMockFoodItemRepository } from "../testHelpers/createMockFoodItemRepository";
import { deleteFoodItemUseCase } from "./usecase";

describe("deleteFoodItemUseCase", () => {
  it("deletes a food item from repository", async () => {
    const repository = createMockFoodItemRepository();

    const deleteFoodItem = deleteFoodItemUseCase(repository);
    await deleteFoodItem("food-1");

    expect(repository.delete).toHaveBeenCalledWith("food-1");
    expect(repository.delete).toHaveBeenCalledTimes(1);
  });
});
