import type { IsoDateTime } from "./isoDateTime";
import type { MealItem } from "./mealItem";

export type Meal = {
  id: string;
  name: string;
  createdAt: IsoDateTime;
  items: MealItem[];
};
