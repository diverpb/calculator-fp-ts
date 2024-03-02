import { Parser, ParseResult, either, char, nOrMore, seq } from "./parser";
import { Tag } from "./types";
import { makeToken, Token } from "./token";
import { pipe } from "fp-ts/function";

type TaggedResult = ParseResult & { tag: Tag };
type TaggedSuccess = { tag: Tag; result: string; rest: string };
type TaggedParser = (str: string) => TaggedResult;
type Tokenizer = (str: string) => Array<Token>;

const tagged =
  (tag: Tag, parser: Parser) =>
  (str: string): TaggedResult => ({ ...parser(str), tag });

const taggedEitherOrError =
  (...parsers: Array<TaggedParser>) =>
  (str: string): TaggedSuccess => {
    const res: TaggedResult | null = parsers.reduce<TaggedResult | null>(
      (acc, par) => (acc?.success ? acc : par(str)),
      null,
    );

    return res?.success
      ? { tag: res.tag, result: res.result, rest: res.rest }
      : { tag: "error", result: str, rest: "" };
  };

const makeTokenizer = (...parsers: Array<TaggedParser>): Tokenizer => {
  const taggedParser = taggedEitherOrError(...parsers);

  const rec = (
    ts: Array<Token>,
    position: number,
    str: string,
  ): Array<Token> =>
    str === ""
      ? ts
      : pipe(str, taggedParser, ({ tag, result, rest }) =>
          rec(
            [...ts, makeToken(tag, result, position)],
            position + result.length,
            rest,
          ),
        );

  return (stringToParse: string) => rec([], 0, stringToParse);
};

const digitsString = "0123456789";
const digit = either(...digitsString.split("").map(char));
const digits = nOrMore(1, digit);
const dot = char(".");

const number = either(
  seq(digits, dot, digits),
  seq(digits, dot),
  seq(digits),
  seq(dot, digits),
);

const space = either(char(" "), char("\n"));

export const tokenize: Tokenizer = makeTokenizer(
  tagged("number", number),
  tagged("plus", char("+")),
  tagged("minus", char("-")),
  tagged("mul", char("*")),
  tagged("div", char("/")),
  tagged("pow", char("^")),
  tagged("paren_l", char("(")),
  tagged("paren_r", char(")")),
  tagged("space", space),
);
