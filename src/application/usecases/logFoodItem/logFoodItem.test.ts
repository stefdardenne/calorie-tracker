import { beforeEach, describe, expect, it, vi } from "vitest";

import type { FoodItem, LogEntry } from "../../../domain/models";
import { DomainError } from "../../../domain/errors";
import { logFoodItemUseCase } from "./index";

const chickenPer100g: FoodItem = {
  id: "food-1",
  name: "Chicken Breast",
  unit: "g",
  baseQuantity: 100,
  carbohydrates: 0,
  proteins: 31,
  fats: 3.6,
};

const validLogEntry: LogEntry = {
  id: "log-1",
  foodItemId: "food-1",
  consumedQuantity: 150,
  occurredAt: "2026-03-22T12:00:00.000Z",
};

describe("logFoodItemUseCase", () => {
  const foodItemRepository = {
    create: vi.fn(async () => undefined),
    findById: vi.fn<(id: string) => Promise<FoodItem | null>>(
      async () => chickenPer100g,
    ),
    listAll: vi.fn(async () => [chickenPer100g]),
  };

  const logEntryRepository = {
    create: vi.fn(async () => undefined),
    listByDateRange: vi.fn(async () => []),
    listByFoodItemId: vi.fn(async () => []),
  };

  beforeEach(() => {
    foodItemRepository.findById.mockReset();
    foodItemRepository.findById.mockResolvedValue(chickenPer100g);
    logEntryRepository.create.mockReset();
  });

  it("creates a log entry when linked food item exists", async () => {
    const logFoodItem = logFoodItemUseCase(
      foodItemRepository,
      logEntryRepository,
    );

    await logFoodItem(validLogEntry);

    expect(foodItemRepository.findById).toHaveBeenCalledWith("food-1");
    expect(logEntryRepository.create).toHaveBeenCalledWith(validLogEntry);
  });

  it("throws when linked food item does not exist", async () => {
    foodItemRepository.findById.mockResolvedValueOnce(null);

    const logFoodItem = logFoodItemUseCase(
      foodItemRepository,
      logEntryRepository,
    );

    await expect(logFoodItem(validLogEntry)).rejects.toThrow(DomainError);
    expect(logEntryRepository.create).not.toHaveBeenCalled();
  });

  it("throws for invalid log entry before repository calls", async () => {
    const logFoodItem = logFoodItemUseCase(
      foodItemRepository,
      logEntryRepository,
    );

    const invalidLogEntry: LogEntry = {
      ...validLogEntry,
      consumedQuantity: 0,
    };

    await expect(logFoodItem(invalidLogEntry)).rejects.toThrow(DomainError);
    expect(foodItemRepository.findById).not.toHaveBeenCalled();
    expect(logEntryRepository.create).not.toHaveBeenCalled();
  });
});
