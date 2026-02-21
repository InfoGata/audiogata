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

// Mock react-chatbotify to prevent timer-related errors
vi.mock("react-chatbotify", () => ({
  default: () => null,
  ChatBot: () => null,
  ChatBotProvider: ({ children }: { children: React.ReactNode }) => children,
  Button: {},
  Flow: {},
  Params: {},
  Settings: {},
  useFlow: () => ({}),
  useChatWindow: () => ({
    isOpen: false,
    openChat: vi.fn(),
    closeChat: vi.fn(),
    toggleChat: vi.fn(),
  }),
}));