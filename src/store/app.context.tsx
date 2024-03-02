import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { calculate } from "../core/calculator";
import { match } from "ts-pattern";
import { randomInt } from "fp-ts/Random";
import { CalculationLine } from "./types";
import { loadLines, saveLines } from "./storage";

type IAppContext = {
  inputValue: string;
  setInputValue: (v: string) => void;
  submit: () => void;
  up: () => void;
  down: () => void;
  lines: CalculationLine[];
};

export const AppContext = createContext<IAppContext | void>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw Error("No context provided");

  return context;
};

const getRandomInt = randomInt(10000, 99999);

export const AppContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const storedLines = useMemo(() => {
    return loadLines();
  }, []);
  const [inputValue, setInputValue] = useState("");
  const [lines, setLines] = useState<CalculationLine[]>(storedLines);
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    saveLines(lines.slice(-10));
  }, [lines]);

  const up = () => {
    if (cursor < lines.length) {
      const nextCursor = cursor + 1;
      const nextValue = lines[lines.length - nextCursor].input;
      setInputValue(nextValue);
      setCursor(nextCursor);
    }
  };

  const down = () => {
    const nextCursor = cursor - 1;
    const nextValue = match(nextCursor)
      .with(0, () => "")
      .when(
        (c) => c > 0,
        () => lines[lines.length - nextCursor].input,
      )
      .otherwise(() => null);

    if (nextValue !== null) {
      setInputValue(nextValue);
      setCursor(nextCursor);
    }
  };

  const submit = () => {
    setCursor(0);

    if (inputValue.trim()) {
      const nextLine = {
        id: getRandomInt(),
        input: inputValue,
        result: calculate(inputValue),
      };
      setLines((prev) => [...prev, nextLine]);
    }

    setInputValue("");
  };

  const context: IAppContext = {
    inputValue,
    setInputValue,
    lines,
    submit,
    up,
    down,
  };

  return <AppContext.Provider value={context}>{children}</AppContext.Provider>;
};
