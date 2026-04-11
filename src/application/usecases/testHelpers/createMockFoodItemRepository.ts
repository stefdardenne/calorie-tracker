import { vi } from "vitest";
import type { MockedFunction } from "vitest";
import type { FoodItemRepository } from "../../ports";

export type MockedFoodItemRepository = {
  [K in keyof FoodItemRepository]: MockedFunction<FoodItemRepository[K]>;
};

export function createMockFoodItemRepository(
  overrides?: Partial<MockedFoodItemRepository>,
): MockedFoodItemRepository {
  return {
    create: vi.fn(async () => undefined),
    findById: vi.fn(async () => null),
    listAll: vi.fn(async () => []),
    delete: vi.fn(async () => undefined),
    ...overrides,
  };
}
