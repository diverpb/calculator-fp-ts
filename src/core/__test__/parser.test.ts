import { char, seq, either, nOrMore, end } from "../parser";

describe("Parser primitives tests", () => {
  test("seq tests", () => {
    const parser = seq(char("a"), char("b"), char("c"));

    expect(parser("abcdef")).toEqual({
      success: true,
      result: "abc",
      rest: "def",
    });

    expect(parser("dabc")).toEqual({
      success: false,
    });

    const exactParser = seq(char("a"), char("b"), char("c"), end);
    expect(exactParser("abc")).toEqual({
      success: true,
      result: "abc",
      rest: "",
    });

    expect(exactParser("abcd")).toEqual({
      success: false,
    });
  });

  test("either tests", () => {
    const eitherChar = either(char("a"), char("b"));

    expect(eitherChar("acd")).toEqual({
      success: true,
      result: "a",
      rest: "cd",
    });

    expect(eitherChar("bcd")).toEqual({
      success: true,
      result: "b",
      rest: "cd",
    });

    expect(eitherChar("cd")).toEqual({
      success: false,
    });
  });

  test("nOrMore tests", () => {
    const parserSeq = seq(char("a"), char("b"));
    expect(nOrMore(2, parserSeq)("abababcd")).toEqual({
      success: true,
      result: "ababab",
      rest: "cd",
    });
    expect(nOrMore(3, parserSeq)("abababcd")).toEqual({
      success: true,
      result: "ababab",
      rest: "cd",
    });
    expect(nOrMore(4, parserSeq)("abababcd")).toEqual({
      success: false,
    });
    expect(nOrMore(0, char("c"))("abababcd")).toEqual({
      success: true,
      result: "",
      rest: "abababcd",
    });
  });
});

describe("complex parser test", () => {
  const digitsString = "0123456789";

  const digit = either(...digitsString.split("").map(char));
  const digits = nOrMore(1, digit);
  const dot = char(".");

  test("number test", () => {
    const number = either(
      seq(digits, dot, digits),
      seq(digits, dot),
      seq(digits),
      seq(dot, digits),
    );

    expect(number("1023")).toEqual({
      success: true,
      result: "1023",
      rest: "",
    });
    expect(number(".5")).toEqual({
      success: true,
      result: ".5",
      rest: "",
    });
    expect(number("0.")).toEqual({
      success: true,
      result: "0.",
      rest: "",
    });
    expect(number("0.456")).toEqual({
      success: true,
      result: "0.456",
      rest: "",
    });
    expect(number("125.76")).toEqual({
      success: true,
      result: "125.76",
      rest: "",
    });

    expect(number("125a.76")).toEqual({
      success: true,
      result: "125",
      rest: "a.76",
    });
    expect(number("_001")).toEqual({
      success: false,
    });
    expect(number("000 ")).toEqual({
      success: true,
      result: "000",
      rest: " ",
    });
    expect(number(".")).toEqual({
      success: false,
    });

    const exactNumber = seq(number, end);
    expect(exactNumber("125a.76")).toEqual({
      success: false,
    });
    expect(exactNumber("000 ")).toEqual({
      success: false,
    });
    expect(exactNumber("125.76")).toEqual({
      success: true,
      result: "125.76",
      rest: "",
    });
  });
});
