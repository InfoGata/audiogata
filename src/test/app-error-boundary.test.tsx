/* eslint-disable i18next/no-literal-string */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import "@/i18n";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import {
  requestAppDataReset,
  runPendingAppDataReset,
} from "@/lib/reset-app-data";

afterEach(cleanup);

const Boom: React.FC<{ throws: boolean }> = ({ throws }) => {
  if (throws) throw new Error("persisted queue is unreadable");
  return <p>the app</p>;
};

describe("AppErrorBoundary", () => {
  const reportError = vi.fn();

  // React logs every caught error, and componentDidCatch re-reports it on
  // purpose; neither is what these tests assert on. reportError is stubbed
  // rather than spied because jsdom doesn't implement it.
  beforeEach(() => {
    reportError.mockClear();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("reportError", reportError);
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders the children when nothing throws", () => {
    render(
      <AppErrorBoundary>
        <Boom throws={false} />
      </AppErrorBoundary>
    );

    expect(screen.getByText("the app")).toBeInTheDocument();
  });

  it("shows a recoverable fallback instead of unmounting the app", async () => {
    render(
      <AppErrorBoundary>
        <Boom throws={true} />
      </AppErrorBoundary>
    );

    expect(screen.getByText("AudioGata couldn't start")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();

    // The message is what makes a bug report actionable, so it has to reach
    // the page rather than only the console.
    await userEvent.click(screen.getByText("Details"));
    expect(screen.getByText("persisted queue is unreadable")).toBeInTheDocument();
  });

  it("re-raises the error so window-level exception capture still sees it", () => {
    render(
      <AppErrorBoundary>
        <Boom throws={true} />
      </AppErrorBoundary>
    );

    expect(reportError).toHaveBeenCalledWith(
      expect.objectContaining({ message: "persisted queue is unreadable" })
    );
  });

  it("renders the children again after a retry that succeeds", async () => {
    // The state lives above the throwing child so retry has something to
    // recover to; a boundary reset alone would just re-throw.
    const Harness: React.FC = () => {
      const [broken, setBroken] = React.useState(true);
      return (
        <>
          <button onClick={() => setBroken(false)}>fix it</button>
          <AppErrorBoundary>
            <Boom throws={broken} />
          </AppErrorBoundary>
        </>
      );
    };

    render(<Harness />);
    expect(screen.getByText("AudioGata couldn't start")).toBeInTheDocument();

    await userEvent.click(screen.getByText("fix it"));
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(screen.getByText("the app")).toBeInTheDocument();
  });
});

const openDatabase = (name: string) =>
  new Promise<void>((resolve, reject) => {
    const open = indexedDB.open(name, 1);
    open.onsuccess = () => {
      // Closed to stand in for the reload: on a real boot nothing holds it.
      open.result.close();
      resolve();
    };
    open.onerror = reject;
  });

const databaseNames = async () =>
  (await indexedDB.databases()).map((d) => d.name);

describe("app data reset", () => {
  const reload = vi.fn();

  beforeEach(() => {
    window.localStorage.clear();
    reload.mockClear();
    // jsdom's location.reload isn't writable, so it's replaced wholesale.
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, reload },
    });
  });

  it("does nothing at startup unless a reset was requested", async () => {
    window.localStorage.setItem("persist:root", "{}");

    await runPendingAppDataReset();

    expect(window.localStorage.getItem("persist:root")).toBe("{}");
  });

  it("defers the deletion to the next boot, because the database is still open", () => {
    window.localStorage.setItem("persist:root", "{}");

    requestAppDataReset("all");

    expect(window.localStorage.getItem("audiogata:reset-app-data")).toBe("all");
    // Deleting here would block on Dexie's live connection.
    expect(window.localStorage.getItem("persist:root")).toBe("{}");
    expect(reload).toHaveBeenCalled();
  });

  it("clears the queue and settings but keeps the database", async () => {
    // Playlists, favorites and downloads live in the database and can't be
    // fetched again, so the lighter reset must not touch it.
    await openDatabase("AudioDatabase");
    window.localStorage.setItem("persist:root", "{}");

    requestAppDataReset("state");
    await runPendingAppDataReset();

    expect(window.localStorage.getItem("persist:root")).toBeNull();
    expect(await databaseNames()).toContain("AudioDatabase");
  });

  it("clears persisted state and the database on a full reset", async () => {
    await openDatabase("AudioDatabase");
    window.localStorage.setItem("persist:root", "{}");
    window.localStorage.setItem("vite-ui-theme", "dark");

    requestAppDataReset("all");
    await runPendingAppDataReset();

    expect(window.localStorage.getItem("persist:root")).toBeNull();
    // The flag itself is cleared first, so a hung deletion can't loop the reset.
    expect(window.localStorage.getItem("audiogata:reset-app-data")).toBeNull();
    // Untouched: a theme preference can't be what's stopping the app booting.
    expect(window.localStorage.getItem("vite-ui-theme")).toBe("dark");
    expect(await databaseNames()).not.toContain("AudioDatabase");
  });
});
