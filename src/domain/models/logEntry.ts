import type { IsoDateTime } from "./isoDateTime";

export type LogEntry = {
  id: string;
  foodItemId: string;
  consumedQuantity: number;
  occurredAt: IsoDateTime;
};
