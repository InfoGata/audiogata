import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import ResizeObserver from "resize-observer-polyfill";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: any) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

globalThis.ResizeObserver = ResizeObserver;

// Mock window.alert to prevent jsdom "Not implemented" errors
Object.defineProperty(window, "alert", {
  writable: true,
  value: () => {},
});

/**
 * Vitest globals are off, so testing-library never registers its own automatic
 * cleanup. Without this a file's last render stays mounted past the end of the
 * file, and React's scheduled work can then run against a torn-down JSDOM.
 * Registered here so a new test can't reintroduce it.
 */
afterEach(cleanup);

/**
 * JSDOM has no layout and implements none of the scroll methods. TanStack
 * Router calls scrollTo on navigation, and each unimplemented call is reported
 * as an error rather than ignored.
 */
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
