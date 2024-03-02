import { left } from "fp-ts/Either";
import { ErrorToken } from "./token";

export type Operator = "plus" | "minus" | "mul" | "div" | "pow";
export type Tag =
  | Operator
  | "number"
  | "space"
  | "error"
  | "paren_l"
  | "paren_r";

export const ErrorMessages = {
  WRONG_SYMBOL: "Unexpected symbol",
  WRONG_END: "Unexpected end of expression",
  VALUE_EXPECTED: "Number expected",
  OPERATOR_EXPECTED: "Operator expected",
};

export class ValidationError extends Error {
  position: number;
  constructor(message: string, position: number) {
    super(message);
    this.position = position;
  }

  toJSON() {
    return { message: this.message, position: this.position };
  }

  static of(message: string, position: number) {
    return left(new ValidationError(message, position));
  }

  static ofErrorToken(token: ErrorToken) {
    return left(
      new ValidationError(ErrorMessages.WRONG_SYMBOL, token.position),
    );
  }
}
