import React from "react";
import { describe, test, expect } from "vitest";
import { screen } from "@testing-library/react";
import i18next from "../i18n";
import App from "../App";
import { renderWithProviders } from "./renderWithProviders";

describe("App", () => {
  test("Should render properly", () => {
    renderWithProviders(<App />);
    const greeting = screen.queryByText(i18next.t("common:greeting"));
    expect(greeting).not.toBeNull();
  });
});
