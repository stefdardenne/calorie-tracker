import type { FoodItemRepository, LogEntryRepository } from "./ports";
import {
  createFoodItemUseCase,
  getLoggedNutritionForEntryUseCase,
  listLogEntriesForDayUseCase,
  logFoodItemUseCase,
} from "./usecases";

export interface CompositionRoot {
  createFoodItem: ReturnType<typeof createFoodItemUseCase>;
  logFoodItem: ReturnType<typeof logFoodItemUseCase>;
  listLogEntriesForDay: ReturnType<typeof listLogEntriesForDayUseCase>;
  getLoggedNutritionForEntry: ReturnType<
    typeof getLoggedNutritionForEntryUseCase
  >;
}

export function createCompositionRoot(
  foodItemRepository: FoodItemRepository,
  logEntryRepository: LogEntryRepository,
): CompositionRoot {
  return {
    createFoodItem: createFoodItemUseCase(foodItemRepository),
    logFoodItem: logFoodItemUseCase(foodItemRepository, logEntryRepository),
    listLogEntriesForDay: listLogEntriesForDayUseCase(logEntryRepository),
    getLoggedNutritionForEntry:
      getLoggedNutritionForEntryUseCase(foodItemRepository),
  };
}
