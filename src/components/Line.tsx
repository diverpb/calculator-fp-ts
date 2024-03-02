import { INPUT_PREFIX } from "../store/constants";
import { match } from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { ErrorText } from "./ErrorText";
import { ResultText } from "./ResultText";
import { InputText } from "./InputText";
import { CalculationLine } from "../store/types";

type Props = { item: CalculationLine };

export const Line = ({ item }: Props) => {
  return (
    <>
      <InputText text={INPUT_PREFIX + item.input} />
      {pipe(
        item.result,
        match(
          (e) => <ErrorText error={e} />,
          (n) => <ResultText result={n} />,
        ),
      )}
    </>
  );
};
