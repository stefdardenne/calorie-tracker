import { vi } from "vitest";
import type { MockedFunction } from "vitest";

import type { MealRepository } from "../../ports";

export type MockedMealRepository = {
  [K in keyof MealRepository]: MockedFunction<MealRepository[K]>;
};

export function createMockMealRepository(
  overrides?: Partial<MockedMealRepository>,
): MockedMealRepository {
  return {
    create: vi.fn(async () => undefined),
    findById: vi.fn(async () => null),
    listAll: vi.fn(async () => []),
    update: vi.fn(async () => undefined),
    delete: vi.fn(async () => undefined),
    ...overrides,
  } as MockedMealRepository;
}
