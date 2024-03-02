import { useEffect, useState } from "react";

type Props = {
  text: string;
};

const INTERVAL = 50;

const charGenerator = (text: string, onNextChar: (v: string) => void) => {
  const arr = text.split("").reverse();

  const timerId = setInterval(() => {
    const nextChar = arr.pop();
    if (!nextChar) {
      clearInterval(timerId);
    } else {
      onNextChar(nextChar);
    }
  }, INTERVAL);

  return () => clearInterval(timerId);
};

export const AnimatedText = ({ text }: Props) => {
  const [result, setResult] = useState("");

  useEffect(() => {
    return charGenerator(text, (nextChar) => setResult((r) => r + nextChar));
  }, [text]);

  return <>{result}</>;
};
