import { Operator } from "./types";

export class Value {
  constructor(public readonly value: number) {}
}

const MAX_ORDER = 10;

const order: Record<Operator, number> = {
  plus: 1,
  minus: 1,
  mul: 2,
  div: 2,
  pow: 3,
};

export class Operation {
  private readonly priority: number;

  constructor(
    public left: Tree,
    public operator: Operator,
    public right: Tree,
    priority?: number,
  ) {
    this.priority = priority || order[operator];
  }

  isPreced(other: Operator) {
    return this.priority >= order[other];
  }
}

export type Tree = Operation | Value;

export const setMaxPriority = (tree: Tree) =>
  tree instanceof Operation
    ? new Operation(tree.left, tree.operator, tree.right, MAX_ORDER)
    : tree;
