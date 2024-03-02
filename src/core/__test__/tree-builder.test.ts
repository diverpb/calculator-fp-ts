import { tokenize } from "../tokenizer";
import { buildTree } from "../tree-builder";
import { Tree, Operation } from "../tree";
import { Operator, ValidationError } from "../types";
import { Either, match } from "fp-ts/Either";
import { pipe } from "fp-ts/function";

const operators: Record<Operator, string> = {
  plus: "+",
  minus: "-",
  mul: "*",
  div: "/",
  pow: "^",
};

function renderTree(result: Either<ValidationError, Tree>): string {
  const rec = (tree: Tree): string =>
    tree instanceof Operation
      ? `(${rec(tree.left)} ${operators[tree.operator]} ${rec(tree.right)})`
      : tree.value.toString();

  return pipe(
    result,
    match((e) => e.message + " at " + e.position, rec),
  );
}

const doTest = (input: string, expected: string) =>
  pipe(input, tokenize, buildTree, renderTree, expect).toEqual(expected);

describe("Build valid tree", () => {
  test.each([
    ["-1", "-1"],
    ["1 + 2*3", "(1 + (2 * 3))"],
    ["1*2 + 3", "((1 * 2) + 3)"],
    ["1*2+3*4", "((1 * 2) + (3 * 4))"],
    ["1 + (2) * 3 / 4", "(1 + ((2 * 3) / 4))"],
    ["   1-2/ 3+4", "((1 - (2 / 3)) + 4)"],
    ["1-2/3+4*5    ", "((1 - (2 / 3)) + (4 * 5))"],
    ["1-2/3 +4+5 *6", "(((1 - (2 / 3)) + 4) + (5 * 6))"],
    ["(1 + 2)*3", "((1 + 2) * 3)"],
    ["1 *((2 + 3) *4)", "(1 * ((2 + 3) * 4))"],
    ["1 + 2 * 3 ^ 4", "(1 + (2 * (3 ^ 4)))"],
    ["1 + (2 * 3) ^ 4", "(1 + ((2 * 3) ^ 4))"],
    [
      "1 + (2 + 3) ^ 4 * 5 ^ (-6 / 7) * 8",
      "(1 + ((((2 + 3) ^ 4) * (5 ^ (-6 / 7))) * 8))",
    ],
  ])("%s -> %s", doTest);
});

describe("Build invalid tree", () => {
  test.each([
    ["- 1", "Number expected at 0"],
    ["1++2", "Number expected at 2"],
    ["1*2 2+3", "Operator expected at 4"],
    ["1 * 2 +   ", "Unexpected end of expression at 6"],
    ["   / 3", "Number expected at 3"],
    [" 2 / ( 3", "No closing parentheses at 5"],
    [" 2 / ) 3", "Number expected at 5"],
    ["1 + (2) 3", "Operator expected at 8"],
  ])("%s -> %s", doTest);
});
