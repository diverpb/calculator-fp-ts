import { match, P } from "ts-pattern";

import { buildTree } from "./tree-builder";
import { pipe } from "fp-ts/function";
import { Either, of, ap, flatten, chain } from "fp-ts/Either";
import { tokenize } from "./tokenizer";
import { Operation, Tree, Value } from "./tree";
import { Operator, ValidationError } from "./types";

type CalculationResult = Either<ValidationError, number>;
type Calculator = (input: string) => CalculationResult;

const operatorFunctions: Record<
  Operator,
  (a: number) => (b: number) => CalculationResult
> = {
  plus: (a) => (b) => of(a + b),
  minus: (a) => (b) => of(a - b),
  mul: (a) => (b) => of(a * b),
  div: (a) => (b) =>
    b === 0 ? ValidationError.of("Division by zero", 0) : of(a / b),
  pow: (a) => (b) => of(Math.pow(a, b)),
};

export const evaluate = (tree: Tree): CalculationResult => {
  return match(tree)
    .returnType<CalculationResult>()
    .with(P.instanceOf(Value), ({ value }) => of(value))
    .with(P.instanceOf(Operation), ({ left, right, operator }) =>
      pipe(
        of(operatorFunctions[operator]),
        ap(evaluate(left)),
        ap(evaluate(right)),
        flatten,
      ),
    )
    .exhaustive();
};

export const calculate: Calculator = (str: string) =>
  pipe(str, tokenize, buildTree, chain(evaluate));
