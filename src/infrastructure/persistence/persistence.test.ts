import { beforeEach, describe, expect, it, vi } from "vitest";

import type { FoodItem, Meal } from "../../domain/models";
import { LocalFoodItemRepository } from "./LocalFoodItemRepository";
import { LocalLogEntryRepository } from "./LocalLogEntryRepository";
import { LocalMealRepository } from "./LocalMealRepository";

const chickenPer100g: FoodItem = {
  id: "food-1",
  name: "Chicken Breast",
  unit: "g",
  baseQuantity: 100,
  carbohydrates: 0,
  proteins: 31,
  fats: 3.6,
};

describe("LocalFoodItemRepository", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("stores and retrieves a food item", async () => {
    const repository = new LocalFoodItemRepository();

    await repository.create(chickenPer100g);
    const retrieved = await repository.findById("food-1");

    expect(retrieved).toEqual(chickenPer100g);
  });

  it("returns null when food item does not exist", async () => {
    const repository = new LocalFoodItemRepository();

    const result = await repository.findById("nonexistent");

    expect(result).toBe(null);
  });

  it("lists all stored food items", async () => {
    const repository = new LocalFoodItemRepository();

    const beefPer100g: FoodItem = {
      id: "food-2",
      name: "Beef",
      unit: "g",
      baseQuantity: 100,
      carbohydrates: 0,
      proteins: 26,
      fats: 5,
    };

    await repository.create(chickenPer100g);
    await repository.create(beefPer100g);
    const allItems = await repository.listAll();

    expect(allItems).toHaveLength(2);
    expect(allItems).toContainEqual(chickenPer100g);
    expect(allItems).toContainEqual(beefPer100g);
  });

  it("persists across repository instances (simulates sessions)", async () => {
    const repository1 = new LocalFoodItemRepository();
    await repository1.create(chickenPer100g);

    const repository2 = new LocalFoodItemRepository();
    const retrieved = await repository2.findById("food-1");

    expect(retrieved).toEqual(chickenPer100g);
  });

  it("updates a food item by recreating it", async () => {
    const repository = new LocalFoodItemRepository();
    await repository.create(chickenPer100g);

    const updated = { ...chickenPer100g, proteins: 32 };
    await repository.create(updated);

    const retrieved = await repository.findById("food-1");
    expect(retrieved?.proteins).toBe(32);
  });
});

describe("LocalLogEntryRepository", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("stores and retrieves log entries by date range", async () => {
    const repository = new LocalLogEntryRepository();

    const logEntry = {
      id: "log-1",
      foodItemId: "food-1",
      consumedQuantity: 150,
      occurredAt: "2026-03-22T12:00:00.000Z" as const,
    };

    await repository.create(logEntry);

    const results = await repository.listByDateRange(
      "2026-03-22T00:00:00.000Z",
      "2026-03-22T23:59:59.999Z",
    );

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual(logEntry);
  });

  it("filters entries outside the date range", async () => {
    const repository = new LocalLogEntryRepository();

    const logEntry = {
      id: "log-1",
      foodItemId: "food-1",
      consumedQuantity: 150,
      occurredAt: "2026-03-22T12:00:00.000Z" as const,
    };

    await repository.create(logEntry);

    const results = await repository.listByDateRange(
      "2026-03-23T00:00:00.000Z",
      "2026-03-23T23:59:59.999Z",
    );

    expect(results).toHaveLength(0);
  });

  it("filters entries by food item id", async () => {
    const repository = new LocalLogEntryRepository();

    const logEntry1 = {
      id: "log-1",
      foodItemId: "food-1",
      consumedQuantity: 150,
      occurredAt: "2026-03-22T12:00:00.000Z" as const,
    };

    const logEntry2 = {
      id: "log-2",
      foodItemId: "food-2",
      consumedQuantity: 200,
      occurredAt: "2026-03-22T13:00:00.000Z" as const,
    };

    await repository.create(logEntry1);
    await repository.create(logEntry2);

    const results = await repository.listByFoodItemId("food-1");

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual(logEntry1);
  });

  it("persists across repository instances (simulates sessions)", async () => {
    const repository1 = new LocalLogEntryRepository();

    const logEntry = {
      id: "log-1",
      foodItemId: "food-1",
      consumedQuantity: 150,
      occurredAt: "2026-03-22T12:00:00.000Z" as const,
    };

    await repository1.create(logEntry);

    const repository2 = new LocalLogEntryRepository();
    const results = await repository2.listByFoodItemId("food-1");

    expect(results).toHaveLength(1);
    expect(results[0]).toEqual(logEntry);
  });
});

describe("LocalMealRepository", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

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

  it("stores and retrieves a meal", async () => {
    const repository = new LocalMealRepository();
    await repository.create(sampleMeal);

    const meal = await repository.findById("meal-1");

    expect(meal).toEqual(sampleMeal);
  });

  it("lists all stored meals", async () => {
    const repository = new LocalMealRepository();

    const secondMeal: Meal = {
      id: "meal-2",
      name: "Dinner",
      createdAt: "2026-04-12T18:00:00.000Z",
      items: [
        {
          foodItemId: "food-1",
          consumedQuantity: 100,
        },
      ],
    };

    await repository.create(sampleMeal);
    await repository.create(secondMeal);

    const meals = await repository.listAll();

    expect(meals).toHaveLength(2);
    expect(meals).toContainEqual(sampleMeal);
    expect(meals).toContainEqual(secondMeal);
  });

  it("deletes a stored meal", async () => {
    const repository = new LocalMealRepository();
    await repository.create(sampleMeal);

    await repository.delete("meal-1");

    const meal = await repository.findById("meal-1");
    expect(meal).toBeNull();
  });

  it("updates a stored meal", async () => {
    const repository = new LocalMealRepository();
    await repository.create(sampleMeal);

    const updatedMeal: Meal = {
      ...sampleMeal,
      name: "Updated Lunch",
      items: [
        ...sampleMeal.items,
        {
          foodItemId: "food-2",
          consumedQuantity: 200,
        },
      ],
    };

    await repository.update(updatedMeal);

    const retrieved = await repository.findById("meal-1");
    expect(retrieved).toEqual(updatedMeal);
  });
});
