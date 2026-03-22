import type { Unit } from "./unit";

export type FoodItem = {
  id: string;
  name: string;
  unit: Unit;
  baseQuantity: number;
  carbohydrates: number;
  proteins: number;
  fats: number;
};
