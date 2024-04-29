import "@testing-library/jest-dom/vitest";
import { screen, waitFor } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import i18next from "../i18n";
import { renderWithProviders } from "./renderWithProviders";
import { Index } from "@/routes";

describe("App", () => {
  test("Should render properly", async () => {
    renderWithProviders(<Index />);
    expect(screen).toBeDefined();
    await waitFor(() =>
      expect(
        screen.queryByText(i18next.t("common:availablePlugins"))
      ).toBeInTheDocument()
    );
  });
});
