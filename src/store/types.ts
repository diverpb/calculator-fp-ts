import { Either } from "fp-ts/Either";
import { ValidationError } from "../core/types";

export type CalculationLine = {
  id: number;
  input: string;
  result: Either<ValidationError, number>;
};
