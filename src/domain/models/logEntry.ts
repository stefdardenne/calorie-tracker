import type { IsoDateTime } from "./isoDateTime";

export type MealType = "breakfast" | "lunch" | "dinner" | "snacks";

export type LogEntry = {
  id: string;
  foodItemId: string;
  consumedQuantity: number;
  occurredAt: IsoDateTime;
  mealType: MealType;
  mealLogId?: string;
};
