import { ValidationError } from "../core/types";
import { ERROR_PREFIX } from "../store/constants";
import { AnimatedText } from "./AnimatedText";

type Props = {
  error: ValidationError;
};

export const ErrorText = ({ error }: Props) => {
  const pad = ERROR_PREFIX + " ".repeat(error.position) + "^ ";

  return (
    <pre className="red-text">
      {pad}
      <AnimatedText text={error.message} />
    </pre>
  );
};
