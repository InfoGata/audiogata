import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import { Provider } from "react-redux";

const posthogMock = vi.hoisted(() => ({
  __loaded: false,
  init: vi.fn(),
}));

vi.mock("posthog-js", () => ({ default: posthogMock }));

// A key has to exist for the component to do anything; whether one does is
// the build's business, not what these tests are about. Hoisted because
// analyticsConfigured is read when lib/analytics is imported, and without it
// the suite would pass or fail depending on whether the machine has a .env.
vi.hoisted(() => vi.stubEnv("VITE_PUBLIC_POSTHOG_KEY", "phc_test"));

import Analytics from "@/components/Analytics";
import { doNotTrackEnabled, shouldCapture } from "@/lib/analytics";
import store from "@/store/store";
import { setDisableAnalytics } from "@/store/reducers/settingsReducer";

type InitOptions = {
  before_send: (event: { event: string } | null) => unknown;
};

const setDnt = (value: string | null) =>
  vi.stubGlobal("navigator", { ...navigator, doNotTrack: value });

const renderAnalytics = () =>
  render(
    <Provider store={store}>
      <Analytics />
    </Provider>
  );

beforeEach(() => {
  posthogMock.__loaded = false;
  posthogMock.init.mockReset();
  posthogMock.init.mockImplementation(() => {
    posthogMock.__loaded = true;
  });
  setDnt(null);
  store.dispatch(setDisableAnalytics(false));
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("shouldCapture", () => {
  it("captures unless the user turned it off", () => {
    expect(shouldCapture(false, false)).toBe(true);
    expect(shouldCapture(true, false)).toBe(false);
  });

  it("treats settings saved before the option existed as not disabled", () => {
    expect(shouldCapture(undefined, false)).toBe(true);
  });

  it("lets Do Not Track veto capturing but never enable it", () => {
    expect(shouldCapture(false, true)).toBe(false);
    expect(shouldCapture(true, true)).toBe(false);
  });
});

describe("doNotTrackEnabled", () => {
  it("reads the browser's signal", () => {
    setDnt("1");
    expect(doNotTrackEnabled()).toBe(true);
    // Some browsers historically sent "yes" rather than "1".
    setDnt("yes");
    expect(doNotTrackEnabled()).toBe(true);
  });

  it("treats an explicit opt-in, or no signal, as no objection", () => {
    setDnt("0");
    expect(doNotTrackEnabled()).toBe(false);
    setDnt(null);
    expect(doNotTrackEnabled()).toBe(false);
  });
});

describe("Analytics", () => {
  it("starts PostHog when capturing is allowed", () => {
    renderAnalytics();

    expect(posthogMock.init).toHaveBeenCalledTimes(1);
  });

  it("never starts PostHog for a user who turned analytics off", () => {
    // Not started and then silenced: an uninitialised client makes no
    // requests at all.
    store.dispatch(setDisableAnalytics(true));
    renderAnalytics();

    expect(posthogMock.init).not.toHaveBeenCalled();
  });

  it("never starts PostHog under Do Not Track", () => {
    setDnt("1");
    renderAnalytics();

    expect(posthogMock.init).not.toHaveBeenCalled();
  });

  it("drops events once analytics is turned off mid-session", () => {
    // PostHog's own opt-out is ignored in cookieless "always" mode, so
    // before_send is what actually stops events after it has started.
    renderAnalytics();
    const options = posthogMock.init.mock.calls[0][1] as InitOptions;
    const event = { event: "$pageview" };

    expect(options.before_send(event)).toBe(event);

    act(() => {
      store.dispatch(setDisableAnalytics(true));
    });

    expect(options.before_send(event)).toBeNull();
  });

  it("starts PostHog if analytics is turned back on", () => {
    store.dispatch(setDisableAnalytics(true));
    renderAnalytics();

    act(() => {
      store.dispatch(setDisableAnalytics(false));
    });

    expect(posthogMock.init).toHaveBeenCalledTimes(1);
  });
});
