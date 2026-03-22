import type { Macros } from "./macros";
import type { Unit } from "./unit";

export type FoodItem = Macros & {
  id: string;
  name: string;
  unit: Unit;
  baseQuantity: number;
};
