import { beforeEach, describe, expect, it, vi } from "vitest";

import type { FoodItem, LogEntry } from "../../domain/models";
import {
  createFoodItemUseCase,
  getLoggedNutritionForEntryUseCase,
  listLogEntriesForDayUseCase,
  logFoodItemUseCase,
} from "./index";

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

describe("createFoodItemUseCase", () => {
  it("creates a valid food item", async () => {
    const repository = {
      create: vi.fn(async () => undefined),
      findById: vi.fn(),
      listAll: vi.fn(),
    };

    const createFoodItem = createFoodItemUseCase(repository);

    await createFoodItem(chickenPer100g);

    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith(chickenPer100g);
  });

  it("throws for invalid food item and does not persist", async () => {
    const repository = {
      create: vi.fn(async () => undefined),
      findById: vi.fn(),
      listAll: vi.fn(),
    };

    const createFoodItem = createFoodItemUseCase(repository);

    const invalidFoodItem: FoodItem = {
      ...chickenPer100g,
      name: "",
    };

    await expect(createFoodItem(invalidFoodItem)).rejects.toThrow(
      "Food item name is required",
    );
    expect(repository.create).not.toHaveBeenCalled();
  });
});

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

    await expect(logFoodItem(validLogEntry)).rejects.toThrow(
      "Cannot log entry for a food item that does not exist",
    );
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

    await expect(logFoodItem(invalidLogEntry)).rejects.toThrow(
      "Consumed quantity must be greater than 0",
    );
    expect(foodItemRepository.findById).not.toHaveBeenCalled();
    expect(logEntryRepository.create).not.toHaveBeenCalled();
  });
});

describe("listLogEntriesForDayUseCase", () => {
  it("requests entries for the full UTC day range", async () => {
    const entries: LogEntry[] = [validLogEntry];
    const repository = {
      create: vi.fn(async () => undefined),
      listByDateRange: vi.fn(async () => entries),
      listByFoodItemId: vi.fn(async () => []),
    };

    const listLogEntriesForDay = listLogEntriesForDayUseCase(repository);

    const date = new Date("2026-03-22T15:30:00.000Z");
    const result = await listLogEntriesForDay(date);

    expect(repository.listByDateRange).toHaveBeenCalledWith(
      "2026-03-22T00:00:00.000Z",
      "2026-03-22T23:59:59.999Z",
    );
    expect(result).toEqual(entries);
  });
});

describe("getLoggedNutritionForEntryUseCase", () => {
  it("returns calculated nutrition when the food item exists", async () => {
    const repository = {
      create: vi.fn(async () => undefined),
      findById: vi.fn(async () => chickenPer100g),
      listAll: vi.fn(async () => [chickenPer100g]),
    };

    const getLoggedNutritionForEntry =
      getLoggedNutritionForEntryUseCase(repository);

    const result = await getLoggedNutritionForEntry(validLogEntry);

    expect(result.carbohydrates).toBe(0);
    expect(result.proteins).toBe(46.5);
    expect(result.fats).toBe(5.4);
    expect(result.calories).toBe(234.6);
  });

  it("throws when the linked food item does not exist", async () => {
    const repository = {
      create: vi.fn(async () => undefined),
      findById: vi.fn(async () => null),
      listAll: vi.fn(async () => []),
    };

    const getLoggedNutritionForEntry =
      getLoggedNutritionForEntryUseCase(repository);

    await expect(getLoggedNutritionForEntry(validLogEntry)).rejects.toThrow(
      "Cannot calculate nutrition for a missing food item",
    );
  });
});
