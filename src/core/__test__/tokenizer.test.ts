import { tokenize } from "../tokenizer";
import { ErrorToken, NumberToken, OperatorToken, Token } from "../token";
import { match, P } from "ts-pattern";
import { map, foldMap } from "fp-ts/Array";
import { Monoid as StringMonoid } from "fp-ts/string";
import { flow } from "fp-ts/function";

const printToken = (token: Token) =>
  `${token.constructor.name} ${token.position}` +
  match(token)
    .with(
      P.instanceOf(NumberToken),
      P.instanceOf(OperatorToken),
      P.instanceOf(ErrorToken),
      (t) => " " + t.value,
    )
    .otherwise(() => "");

const printTokens = flow(
  map(printToken),
  foldMap(StringMonoid)((s) => "\n" + s),
  (s) => s + "\n",
);

test("tokenize tests", () => {
  expect(tokenize("")).toEqual([]);

  expect(printTokens(tokenize(" "))).toEqual(`
SpaceToken 0
`);

  expect(printTokens(tokenize("12.*.5+2 / -13"))).toEqual(`
NumberToken 0 12
OperatorToken 3 mul
NumberToken 4 0.5
OperatorToken 6 plus
NumberToken 7 2
SpaceToken 8
OperatorToken 9 div
SpaceToken 10
OperatorToken 11 minus
NumberToken 12 13
`);

  expect(printTokens(tokenize("."))).toEqual(`
ErrorToken 0 .
`);

  expect(printTokens(tokenize("123 + a - 50"))).toEqual(`
NumberToken 0 123
SpaceToken 3
OperatorToken 4 plus
SpaceToken 5
ErrorToken 6 a - 50
`);
});
