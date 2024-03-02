import { buildTree } from "../tree-builder";
import { evaluate } from "../calculator";
import { tokenize } from "../tokenizer";
import { pipe } from "fp-ts/function";
import { map, fold, chain } from "fp-ts/Either";

describe("calculator", () => {
  test.each([
    ["1+-2", -1],
    ["-1-2", -3],
    ["-1--2", 1],
    ["-1", -1],
    ["1 + 2*3", 7],
    ["1*2 + 3", 5],
    ["1*2+3*4", 14],
    ["1+2/(3-3)", "Division by zero"],
  ])("%s -> %s", (str, expected) => {
    pipe(
      str,
      tokenize,
      buildTree,
      chain(evaluate),
      fold((e) => e.message, String),
      expect,
    ).toEqual(String(expected));
  });
});
