import type { FoodItemRepository, LogEntryRepository } from "./ports";
import {
  createFoodItemUseCase,
  deleteFoodItemUseCase,
  getLoggedNutritionForEntryUseCase,
  listFoodItemsUseCase,
  listLogEntriesForDayUseCase,
  logFoodItemUseCase,
} from "./usecases";
import { LocalFoodItemRepository } from "../infrastructure/persistence/LocalFoodItemRepository";
import { LocalLogEntryRepository } from "../infrastructure/persistence/LocalLogEntryRepository";

export interface CompositionRoot {
  createFoodItem: ReturnType<typeof createFoodItemUseCase>;
  deleteFoodItem: ReturnType<typeof deleteFoodItemUseCase>;
  listFoodItems: ReturnType<typeof listFoodItemsUseCase>;
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
    deleteFoodItem: deleteFoodItemUseCase(foodItemRepository),
    listFoodItems: listFoodItemsUseCase(foodItemRepository),
    logFoodItem: logFoodItemUseCase(foodItemRepository, logEntryRepository),
    listLogEntriesForDay: listLogEntriesForDayUseCase(logEntryRepository),
    getLoggedNutritionForEntry:
      getLoggedNutritionForEntryUseCase(foodItemRepository),
  };
}

export function createDefaultCompositionRoot(): CompositionRoot {
  const foodItemRepository = new LocalFoodItemRepository();
  const logEntryRepository = new LocalLogEntryRepository();
  return createCompositionRoot(foodItemRepository, logEntryRepository);
}
