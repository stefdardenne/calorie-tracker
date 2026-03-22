import { describe, expect, it } from "vitest";
import type { FoodItem, LogEntry, Macros } from "../models";
import {
  calculateCaloriesFromMacros,
  calculateLoggedNutrition,
  scaleMacros,
} from "./nutrition";

const chickenPer100g: FoodItem = {
  id: "food-1",
  name: "Chicken Breast",
  unit: "g",
  baseQuantity: 100,
  carbohydrates: 0,
  proteins: 31,
  fats: 3.6,
};

describe("scaleMacros", () => {
  it("scales macros based on consumed quantity", () => {
    const result = scaleMacros(chickenPer100g, 150);

    expect(result).toEqual({
      carbohydrates: 0,
      proteins: 46.5,
      fats: 5.4,
    });
  });

  it("throws when base quantity is invalid", () => {
    const invalidFood: FoodItem = {
      ...chickenPer100g,
      baseQuantity: 0,
    };

    expect(() => scaleMacros(invalidFood, 100)).toThrow(
      "Food item baseQuantity must be greater than 0",
    );
  });

  it("throws when consumed quantity is invalid", () => {
    expect(() => scaleMacros(chickenPer100g, 0)).toThrow(
      "Consumed quantity must be greater than 0",
    );
  });
});

describe("calculateCaloriesFromMacros", () => {
  it("calculates calories using the 4-4-9 rule", () => {
    const macros: Macros = {
      carbohydrates: 10,
      proteins: 20,
      fats: 5,
    };

    const calories = calculateCaloriesFromMacros(macros);

    expect(calories).toBe(165);
  });

  it("throws when a macro value is negative", () => {
    const invalidMacros: Macros = {
      carbohydrates: -1,
      proteins: 10,
      fats: 1,
    };

    expect(() => calculateCaloriesFromMacros(invalidMacros)).toThrow(
      "Macro values cannot be negative",
    );
  });
});

describe("calculateLoggedNutrition", () => {
  it("returns scaled macros and derived calories for a log entry", () => {
    const logEntry: LogEntry = {
      id: "log-1",
      foodItemId: "food-1",
      consumedQuantity: 150,
      occurredAt: "2026-03-22T12:00:00.000Z",
    };

    const result = calculateLoggedNutrition(chickenPer100g, logEntry);

    expect(result).toEqual({
      carbohydrates: 0,
      proteins: 46.5,
      fats: 5.4,
      calories: 234.6,
    });
  });

  it("handles decimal consumed quantities", () => {
    const logEntry: LogEntry = {
      id: "log-3",
      foodItemId: "food-1",
      consumedQuantity: 87.5,
      occurredAt: "2026-03-22T12:30:00.000Z",
    };

    const result = calculateLoggedNutrition(chickenPer100g, logEntry);

    expect(result.carbohydrates).toBeCloseTo(0, 10);
    expect(result.proteins).toBeCloseTo(27.125, 10);
    expect(result.fats).toBeCloseTo(3.15, 10);
    expect(result.calories).toBeCloseTo(136.85, 10);
  });

  it("throws when log entry references a different food item", () => {
    const wrongFoodLog: LogEntry = {
      id: "log-2",
      foodItemId: "food-2",
      consumedQuantity: 100,
      occurredAt: "2026-03-22T12:00:00.000Z",
    };

    expect(() =>
      calculateLoggedNutrition(chickenPer100g, wrongFoodLog),
    ).toThrow("Log entry foodItemId does not match the provided food item");
  });
});
