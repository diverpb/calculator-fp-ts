import { RESULT_PREFIX } from "../store/constants";
import { AnimatedText } from "./AnimatedText";

type Props = {
  result: number;
};

export const ResultText = ({ result }: Props) => {
  return (
    <pre className={"green-text"}>
      {RESULT_PREFIX}
      <AnimatedText text={"Result: " + result} />
    </pre>
  );
};
