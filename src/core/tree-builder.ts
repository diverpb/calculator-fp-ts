import {
  ErrorToken,
  NumberToken,
  OperatorToken,
  Token,
  SpaceToken,
  LeftParenToken,
  RightParenToken,
} from "./token";
import { match, P } from "ts-pattern";
import { ErrorMessages, Operator, ValidationError } from "./types";
import { Operation, setMaxPriority, Tree, Value } from "./tree";
import { Either, of, chain, mapLeft, right, map, bind } from "fp-ts/Either";
import { pipe } from "fp-ts/function";

function isMinus(token: Token): token is OperatorToken {
  return token instanceof OperatorToken && token.value === "minus";
}

const getTokensInParentheses = (
  tokens: Token[],
): Either<ValidationError, { inParen: Token[]; rest: Token[] }> => {
  const [leftParen, ...tail] = tokens;

  const rec = (
    tokens: Token[],
    result: Token[],
    counter: number,
  ): Either<ValidationError, { inParen: Token[]; rest: Token[] }> => {
    const [head, ...rest] = tokens;

    return match([counter, head as Token | null])
      .returnType<
        Either<ValidationError, { inParen: Token[]; rest: Token[] }>
      >()
      .with([P._, P.nullish], () =>
        ValidationError.of("No closing parentheses", leftParen.position),
      )
      .with([1, P.instanceOf(RightParenToken)], () =>
        right({ inParen: result, rest }),
      )
      .with([P.number, P.instanceOf(LeftParenToken)], () =>
        rec(rest, [...result, head], counter + 1),
      )
      .with([P.number, P.instanceOf(RightParenToken)], () =>
        rec(rest, [...result, head], counter - 1),
      )
      .otherwise(() => rec(rest, [...result, head], counter));
  };

  return rec(tail, [], 1);
};

const joinOperator = (tree: Tree, rOperator: Operator, rValue: Tree): Tree => {
  if (tree instanceof Value || tree.isPreced(rOperator))
    return new Operation(tree, rOperator, rValue);

  return new Operation(
    tree.left,
    tree.operator,
    joinOperator(tree.right, rOperator, rValue),
  );
};

const getNextValue = (
  tokens: Token[],
): Either<ValidationError, { value: Tree; rest: Token[] }> =>
  match(tokens)
    .returnType<Either<ValidationError, { value: Tree; rest: Token[] }>>()
    .with([], () => ValidationError.of(ErrorMessages.WRONG_END, 0))
    .with([P.instanceOf(SpaceToken), ...P.array()], ([_, ...rest]) =>
      getNextValue(rest),
    )
    .with([P.instanceOf(ErrorToken), ...P.array()], ([error]) =>
      ValidationError.ofErrorToken(error),
    )
    .with([P.instanceOf(NumberToken), ...P.array()], ([num, ...rest]) =>
      of({ value: new Value(num.value), rest }),
    )
    .with(
      [P.when(isMinus), P.instanceOf(NumberToken), ...P.array()],
      ([_, num, ...rest]) => of({ value: new Value(-num.value), rest }),
    )
    .with([P.instanceOf(LeftParenToken), ...P.array()], (tokens) =>
      pipe(
        tokens,
        getTokensInParentheses,
        bind("tree", ({ inParen }) => buildTree(inParen)),
        map(({ tree, rest }) => ({
          value: setMaxPriority(tree),
          rest,
        })),
      ),
    )
    .otherwise(([h]) =>
      ValidationError.of(ErrorMessages.VALUE_EXPECTED, h.position),
    );

const addNextOperator = (
  tree: Tree,
  tokens: Token[],
): Either<ValidationError, Tree> =>
  match(tokens)
    .returnType<Either<ValidationError, Tree>>()
    .with([P.instanceOf(SpaceToken), ...P.array()], ([_, ...rest]) =>
      addNextOperator(tree, rest),
    )
    .with([P.instanceOf(ErrorToken), ...P.array()], ([error]) =>
      ValidationError.ofErrorToken(error),
    )
    .with([], () => of(tree))
    .with(
      [P.instanceOf(OperatorToken), ...P.array()],
      ([operator, ...restTokens]) =>
        pipe(
          restTokens,
          getNextValue,
          mapLeft((e) =>
            e.position === 0
              ? new ValidationError(e.message, operator.position)
              : e,
          ),
          chain(({ value, rest }) =>
            addNextOperator(joinOperator(tree, operator.value, value), rest),
          ),
        ),
    )
    .with([P.select(), ...P.array()], (head) =>
      ValidationError.of(ErrorMessages.OPERATOR_EXPECTED, head.position),
    )
    .exhaustive();

export const buildTree = (tokens: Token[]): Either<ValidationError, Tree> =>
  pipe(
    tokens,
    getNextValue,
    chain(({ value, rest }) => addNextOperator(value, rest)),
  );
