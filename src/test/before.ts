import ResizeObserver from "resize-observer-polyfill";
import { vi } from "vitest";

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

global.ResizeObserver = ResizeObserver;

// Mock window.alert to prevent jsdom "Not implemented" errors
Object.defineProperty(window, "alert", {
  writable: true,
  value: () => {},
});
