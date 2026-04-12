import type { Meal } from "../../../domain/models/meal";

export interface MealRepository {
  create(meal: Meal): Promise<void>;
  findById(id: string): Promise<Meal | null>;
  listAll(): Promise<Meal[]>;
  update(meal: Meal): Promise<void>;
  delete(id: string): Promise<void>;
}
