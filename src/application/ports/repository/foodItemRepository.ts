import type { FoodItem } from "../../../domain/models";

export interface FoodItemRepository {
  create(foodItem: FoodItem): Promise<void>;
  findById(id: string): Promise<FoodItem | null>;
  listAll(): Promise<FoodItem[]>;
}
