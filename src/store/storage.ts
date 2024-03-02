import { CalculationLine } from "./types";
import { parse, stringify } from "fp-ts/Json";
import {
  chain,
  fromNullable,
  map,
  fromEither,
  flatMap,
  getOrElse,
  some,
  none,
} from "fp-ts/Option";
import { pipe } from "fp-ts/function";

const KEY = "CALCULATION_LINES";

export const loadLines = (): CalculationLine[] =>
  pipe(
    localStorage.getItem(KEY),
    fromNullable,
    map(parse),
    flatMap(fromEither),
    chain((json) => (Array.isArray(json) ? some(json) : none)),
    getOrElse<CalculationLine[]>(() => []),
  );

export const saveLines = (lines: CalculationLine[]) =>
  pipe(
    lines,
    stringify,
    fromEither,
    map((str) => localStorage.setItem(KEY, str)),
  );
