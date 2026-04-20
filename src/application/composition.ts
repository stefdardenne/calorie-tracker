import type {
  FoodItemRepository,
  LogEntryRepository,
  MealRepository,
} from "./ports";
import {
  createFoodItemUseCase,
  createMealUseCase,
  deleteLogEntryUseCase,
  deleteMealUseCase,
  deleteFoodItemUseCase,
  getLoggedNutritionForEntryUseCase,
  listFoodItemsUseCase,
  listLogEntriesForDayUseCase,
  listMealsUseCase,
  logFoodItemUseCase,
  logMealUseCase,
  updateLogEntryUseCase,
  updateMealUseCase,
} from "./usecases";
import { LocalFoodItemRepository } from "../infrastructure/persistence/LocalFoodItemRepository";
import { LocalLogEntryRepository } from "../infrastructure/persistence/LocalLogEntryRepository";
import { LocalMealRepository } from "../infrastructure/persistence/LocalMealRepository";

export interface CompositionRoot {
  createFoodItem: ReturnType<typeof createFoodItemUseCase>;
  createMeal: ReturnType<typeof createMealUseCase>;
  deleteFoodItem: ReturnType<typeof deleteFoodItemUseCase>;
  deleteMeal: ReturnType<typeof deleteMealUseCase>;
  deleteLogEntry: ReturnType<typeof deleteLogEntryUseCase>;
  listFoodItems: ReturnType<typeof listFoodItemsUseCase>;
  logFoodItem: ReturnType<typeof logFoodItemUseCase>;
  logMeal: ReturnType<typeof logMealUseCase>;
  listLogEntriesForDay: ReturnType<typeof listLogEntriesForDayUseCase>;
  listMeals: ReturnType<typeof listMealsUseCase>;
  updateLogEntry: ReturnType<typeof updateLogEntryUseCase>;
  updateMeal: ReturnType<typeof updateMealUseCase>;
  getLoggedNutritionForEntry: ReturnType<
    typeof getLoggedNutritionForEntryUseCase
  >;
}

export function createCompositionRoot(
  foodItemRepository: FoodItemRepository,
  logEntryRepository: LogEntryRepository,
  mealRepository: MealRepository,
): CompositionRoot {
  return {
    createFoodItem: createFoodItemUseCase(foodItemRepository),
    createMeal: createMealUseCase(mealRepository),
    deleteFoodItem: deleteFoodItemUseCase(foodItemRepository),
    deleteMeal: deleteMealUseCase(mealRepository),
    deleteLogEntry: deleteLogEntryUseCase(logEntryRepository),
    listFoodItems: listFoodItemsUseCase(foodItemRepository),
    logFoodItem: logFoodItemUseCase(foodItemRepository, logEntryRepository),
    logMeal: logMealUseCase(foodItemRepository, logEntryRepository),
    listLogEntriesForDay: listLogEntriesForDayUseCase(logEntryRepository),
    listMeals: listMealsUseCase(mealRepository),
    updateLogEntry: updateLogEntryUseCase(logEntryRepository),
    updateMeal: updateMealUseCase(mealRepository),
    getLoggedNutritionForEntry:
      getLoggedNutritionForEntryUseCase(foodItemRepository),
  };
}

export function createDefaultCompositionRoot(): CompositionRoot {
  const foodItemRepository = new LocalFoodItemRepository();
  const logEntryRepository = new LocalLogEntryRepository();
  const mealRepository = new LocalMealRepository();
  return createCompositionRoot(
    foodItemRepository,
    logEntryRepository,
    mealRepository,
  );
}
