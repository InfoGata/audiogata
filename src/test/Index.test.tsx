import "@testing-library/jest-dom/vitest";
import { screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import i18next from "../i18n";
import { renderWithProviders } from "./renderWithProviders";
import { Index } from "@/routes";

describe("App", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  test("Should render properly", async () => {
    renderWithProviders(<Index />);
    expect(screen).toBeDefined();

    // Advance timers to complete ExtensionProvider's timeout
    await vi.advanceTimersByTimeAsync(1000);

    await waitFor(() =>
      expect(
        screen.queryByText(i18next.t("common:availablePlugins"))
      ).toBeInTheDocument()
    );
  });
});
