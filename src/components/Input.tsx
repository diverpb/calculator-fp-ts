import React, { useRef } from "react";
import { INPUT_PREFIX } from "../store/constants";
import { useAppContext } from "../store/app.context";
import { match } from "ts-pattern";

export const Input = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { inputValue, setInputValue, submit, up, down } = useAppContext();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const notMatched = match(e.key)
      .with("Enter", submit)
      .with("ArrowUp", up)
      .with("ArrowDown", down)
      .otherwise(() => true);

    if (!notMatched) {
      e.preventDefault();
    }
  };

  const handleSubmitClick = () => {
    submit();
    inputRef.current?.focus();
  };

  return (
    <div className="input-container" onKeyDown={handleKeyDown}>
      <pre>{INPUT_PREFIX}</pre>
      <input
        data-testid="input"
        ref={inputRef}
        autoFocus
        className="input"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button
        data-testid="submit"
        className="submit-button"
        onClick={handleSubmitClick}
      >
        Submit
      </button>
    </div>
  );
};
