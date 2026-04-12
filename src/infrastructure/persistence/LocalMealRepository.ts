import type { MealRepository } from "../../application/ports";
import type { Meal } from "../../domain/models/meal";

const STORAGE_KEY_PREFIX = "meal:";

export class LocalMealRepository implements MealRepository {
  async create(meal: Meal): Promise<void> {
    const key = `${STORAGE_KEY_PREFIX}${meal.id}`;
    localStorage.setItem(key, JSON.stringify(meal));
  }

  async findById(id: string): Promise<Meal | null> {
    const key = `${STORAGE_KEY_PREFIX}${id}`;
    const stored = localStorage.getItem(key);
    if (stored === null) {
      return null;
    }
    return JSON.parse(stored) as Meal;
  }

  async listAll(): Promise<Meal[]> {
    const meals: Meal[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEY_PREFIX)) {
        const stored = localStorage.getItem(key);
        if (stored !== null) {
          meals.push(JSON.parse(stored) as Meal);
        }
      }
    }
    return meals;
  }

  async update(meal: Meal): Promise<void> {
    const key = `${STORAGE_KEY_PREFIX}${meal.id}`;
    localStorage.setItem(key, JSON.stringify(meal));
  }

  async delete(id: string): Promise<void> {
    const key = `${STORAGE_KEY_PREFIX}${id}`;
    localStorage.removeItem(key);
  }
}
