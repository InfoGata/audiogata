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
