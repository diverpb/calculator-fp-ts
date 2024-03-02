import React from "react";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

test("renders calculator app", () => {
  render(<App />);
  const welcomeElement = screen.getByText(/calculator app/i);
  expect(welcomeElement).toBeInTheDocument();
});

test("Calculate 1 + 1", async () => {
  render(<App />);
  // eslint-disable-next-line testing-library/no-unnecessary-act
  act(() => {
    userEvent.type(screen.getByTestId("input"), "1 + 1");
    userEvent.click(screen.getByTestId("submit"));
  });

  const result = await screen.findByText(/Result: 2/);
  expect(result).toBeInTheDocument();
});
