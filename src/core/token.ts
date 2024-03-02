import { Operator, Tag } from "./types";
import { match } from "ts-pattern";

export class NumberToken {
  constructor(
    public position: number,
    public value: number,
  ) {}
}

export class OperatorToken {
  constructor(
    public position: number,
    public value: Operator,
  ) {}
}

export class LeftParenToken {
  constructor(public position: number) {}
}

export class RightParenToken {
  constructor(public position: number) {}
}

export class SpaceToken {
  constructor(public position: number) {}
}

export class ErrorToken {
  constructor(
    public position: number,
    public value: string,
  ) {}
}

export type Token =
  | NumberToken
  | OperatorToken
  | SpaceToken
  | ErrorToken
  | LeftParenToken
  | RightParenToken;

export function makeToken(tag: Tag, value: string, position: number) {
  return match(tag)
    .returnType<Token>()
    .with("number", () => new NumberToken(position, Number(value)))
    .with("paren_l", () => new LeftParenToken(position))
    .with("paren_r", () => new RightParenToken(position))
    .with("space", () => new SpaceToken(position))
    .with("error", () => new ErrorToken(position, value))
    .with(
      "plus",
      "minus",
      "mul",
      "div",
      "pow",
      (tag) => new OperatorToken(position, tag),
    )
    .exhaustive();
}
