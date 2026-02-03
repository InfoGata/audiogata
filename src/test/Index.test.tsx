import "@testing-library/jest-dom/vitest";
import { cleanup, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import i18next from "../i18n";
import { renderWithProviders } from "./renderWithProviders";
import { Index } from "@/routes";

describe("App", () => {
  afterEach(() => {
    cleanup();
  });

  test(
    "Should render properly",
    async () => {
      renderWithProviders(<Index />);
      expect(screen).toBeDefined();

      await waitFor(
        () =>
          expect(
            screen.queryByText(i18next.t("common:availablePlugins"))
          ).toBeInTheDocument(),
        { timeout: 10000 }
      );
    },
    15000
  );
});
