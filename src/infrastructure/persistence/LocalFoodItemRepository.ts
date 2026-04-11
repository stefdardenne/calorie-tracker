import type { FoodItem } from "../../domain/models";
import type { FoodItemRepository } from "../../application/ports";

const STORAGE_KEY_PREFIX = "food:";

export class LocalFoodItemRepository implements FoodItemRepository {
  async create(foodItem: FoodItem): Promise<void> {
    const key = `${STORAGE_KEY_PREFIX}${foodItem.id}`;
    localStorage.setItem(key, JSON.stringify(foodItem));
  }

  async findById(id: string): Promise<FoodItem | null> {
    const key = `${STORAGE_KEY_PREFIX}${id}`;
    const stored = localStorage.getItem(key);
    if (stored === null) {
      return null;
    }
    return JSON.parse(stored) as FoodItem;
  }

  async listAll(): Promise<FoodItem[]> {
    const items: FoodItem[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_KEY_PREFIX)) {
        const stored = localStorage.getItem(key);
        if (stored !== null) {
          items.push(JSON.parse(stored) as FoodItem);
        }
      }
    }
    return items;
  }

  async delete(id: string): Promise<void> {
    const key = `${STORAGE_KEY_PREFIX}${id}`;
    localStorage.removeItem(key);
  }
}
