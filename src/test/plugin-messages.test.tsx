import { renderHook } from "@testing-library/react";
import React from "react";
import { describe, expect, test, vi } from "vitest";
import PluginsContext, { PluginMessage } from "../contexts/PluginsContext";
import usePluginMessages from "../hooks/usePluginMessages";

/** A stand-in for the provider's subscription, with a way to post. */
const makeMessages = () => {
  const listeners = new Set<(message: PluginMessage) => void>();
  return {
    subscribeToPluginMessages: (listener: (message: PluginMessage) => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    post: (message: PluginMessage) => listeners.forEach((l) => l(message)),
    listenerCount: () => listeners.size,
  };
};

const renderWithFrame = (
  messages: ReturnType<typeof makeMessages>,
  pluginId: string
) => {
  const postMessage = vi.fn();
  const frame = {
    current: { contentWindow: { postMessage } },
  } as unknown as React.RefObject<HTMLIFrameElement>;
  const wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
    <PluginsContext.Provider
      value={
        {
          subscribeToPluginMessages: messages.subscribeToPluginMessages,
        } as any
      }
    >
      {children}
    </PluginsContext.Provider>
  );
  const hook = renderHook(() => usePluginMessages(pluginId, frame), {
    wrapper,
  });
  return { postMessage, ...hook };
};

describe("usePluginMessages", () => {
  test("forwards every message posted in the same tick, in order", () => {
    const messages = makeMessages();
    const { postMessage } = renderWithFrame(messages, "plugin-a");

    messages.post({ pluginId: "plugin-a", message: { requestId: 0 } });
    messages.post({ pluginId: "plugin-a", message: { requestId: 1 } });
    messages.post({ pluginId: "plugin-a", message: { requestId: 2 } });

    expect(postMessage.mock.calls.map(([message]) => message)).toEqual([
      { requestId: 0 },
      { requestId: 1 },
      { requestId: 2 },
    ]);
  });

  test("ignores messages from other plugins", () => {
    const messages = makeMessages();
    const { postMessage } = renderWithFrame(messages, "plugin-a");

    messages.post({ pluginId: "plugin-b", message: "not mine" });

    expect(postMessage).not.toHaveBeenCalled();
  });

  test("stops listening when unmounted", () => {
    const messages = makeMessages();
    const { unmount } = renderWithFrame(messages, "plugin-a");
    expect(messages.listenerCount()).toBe(1);

    unmount();

    expect(messages.listenerCount()).toBe(0);
  });
});
