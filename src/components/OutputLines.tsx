import { InputText } from "./InputText";
import { Line } from "./Line";
import React from "react";
import { WELCOME_TEXT } from "../store/constants";
import { useAppContext } from "../store/app.context";

export const OutputLines = () => {
  const { lines } = useAppContext();

  return (
    <div className="output-container">
      <InputText text={WELCOME_TEXT} />
      {lines.map((line) => (
        <Line key={line.id} item={line} />
      ))}
    </div>
  );
};
