export type DomainErrorCode =
  | "INVALID_FOOD_ITEM_NAME"
  | "INVALID_BASE_QUANTITY"
  | "INVALID_MACRO_VALUES"
  | "INVALID_CONSUMED_QUANTITY"
  | "INVALID_ISO_DATETIME"
  | "FOOD_ITEM_ID_MISMATCH";

export class DomainError extends Error {
  readonly code: DomainErrorCode;

  constructor(code: DomainErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "DomainError";
  }
}
