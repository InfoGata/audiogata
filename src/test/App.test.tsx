import { screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import App from "../App";
import i18next from "../i18n";
import { renderWithProviders } from "./renderWithProviders";

describe("App", () => {
  test("Should render properly", () => {
    renderWithProviders(<App />);
    const greeting = screen.queryByText(i18next.t("common:greeting"));
    expect(greeting).not.toBeNull();
  });
});
