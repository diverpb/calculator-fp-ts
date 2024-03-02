import { match, P } from "ts-pattern";

const head = (str: string) => {
  return [str[0] || "", str.slice(1)];
};

export type ParseSuccess = {
  success: true;
  result: string;
  rest: string;
};
const success = (result: string, rest: string): ParseSuccess => ({
  success: true,
  result,
  rest,
});

export type ParseFail = {
  success: false;
};
const fail = (): ParseFail => ({ success: false });

export type ParseResult = ParseSuccess | ParseFail;

export type Parser = (str: string) => ParseResult;

const addParseResult = (a: ParseResult, b: ParseResult) =>
  match([a, b])
    .with([{ success: true }, { success: true }], ([a, b]) =>
      success(a.result + b.result, b.rest),
    )
    .otherwise(() => fail());

export const char =
  (c: string): Parser =>
  (str) => {
    const [h, rest] = head(str);

    return h === c
      ? {
          success: true,
          result: h,
          rest,
        }
      : { success: false };
  };

export const seq =
  (...parsers: Array<Parser>): Parser =>
  (str) =>
    parsers.reduce<ParseResult>(
      (acc, par) => (acc.success ? addParseResult(acc, par(acc.rest)) : acc),
      success("", str),
    );

export const either =
  (...parsers: Array<Parser>): Parser =>
  (str) =>
    parsers.reduce<ParseResult>(
      (acc, par) => (acc.success ? acc : par(str)),
      fail(),
    );

export const end: Parser = (str) => (str === "" ? success("", "") : fail());

export const nOrMore =
  (n: number, parser: Parser): Parser =>
  (str: string) => {
    const rec = (count: number, acc: ParseSuccess): ParseResult => {
      return match([parser(acc.rest), count >= n] as const)
        .returnType<ParseResult>()
        .with([{ success: false }, false], () => fail())
        .with([{ success: false }, true], () => acc)
        .with([{ success: true }, P._], ([{ result, rest }]) =>
          rec(count + 1, success(acc.result + result, rest)),
        )
        .otherwise(() => fail());
    };

    return rec(0, success("", str));
  };
