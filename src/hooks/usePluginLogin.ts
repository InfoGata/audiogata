import React from "react";
import type { PluginFrameContainer } from "@/contexts/PluginsContext";
import { waitForDeepLinkLogin } from "@/lib/pending-logins";

/** Must match the channel in public/login_popup.html. */
const OAUTH_CHANNEL = "audiogata-oauth";
/** How long to wait for a sign-in that happens outside the app (Android). */
const EXTERNAL_LOGIN_TIMEOUT_MS = 10 * 60 * 1000;

/**
 * Signs in to a plugin that implements onLogin/onLoginCallback, from a button
 * in the app rather than the plugin's own options page.
 *
 * The popup is opened blank before anything is awaited, so the browser still
 * counts the click that caused it and doesn't block it. The plugin returns the
 * OAuth url, the app navigates the popup there, and the callback url that
 * comes back is relayed to the plugin's onLoginCallback.
 */
export function usePluginLogin(plugin: PluginFrameContainer | undefined) {
  const [hasLogin, setHasLogin] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  const refresh = React.useCallback(async () => {
    if (!plugin) {
      setHasLogin(false);
      setIsLoggedIn(false);
      return;
    }
    const canLogin = await plugin.hasDefined.onLogin();
    setHasLogin(canLogin);
    setIsLoggedIn(
      canLogin && (await plugin.hasDefined.onIsLoggedIn())
        ? await plugin.remote.onIsLoggedIn()
        : false
    );
  }, [plugin]);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const login = React.useCallback(
    async (apiKey = "", apiSecret = "") => {
      if (!plugin) return;
      const popupName = crypto.randomUUID();
      const popup = window.open("about:blank", popupName, "width=600,height=700");
      setIsLoggingIn(true);
      try {
        const response = await plugin.remote.onLogin({
          apiKey,
          apiSecret,
          popupName,
        });
        if (response?.url) {
          if (popup) {
            popup.location.href = response.url;
          } else {
            window.open(response.url, "_blank");
          }
        }
        if (await plugin.hasDefined.onLoginCallback()) {
          const callbackUrl = await waitForCallback(popup, plugin.id || "");
          if (callbackUrl) {
            await plugin.remote.onLoginCallback({ url: callbackUrl });
          }
        }
      } finally {
        setIsLoggingIn(false);
        await refresh();
      }
    },
    [plugin, refresh]
  );

  const logout = React.useCallback(async () => {
    if (!plugin || !(await plugin.hasDefined.onLogout())) return;
    await plugin.remote.onLogout();
    await refresh();
  }, [plugin, refresh]);

  return { hasLogin, isLoggedIn, isLoggingIn, login, logout, refresh };
}

/**
 * Wait for the OAuth callback url. It can arrive three ways, and the first
 * wins: a message from the popup, the same-origin BroadcastChannel (which
 * still works when the popup lost its opener), or an Android deep link.
 * Resolves null if the popup is closed without finishing.
 */
function waitForCallback(
  popup: Window | null,
  pluginId: string
): Promise<string | null> {
  return new Promise((resolve) => {
    const abort = new AbortController();
    let channel: BroadcastChannel | undefined;

    const finish = (url: string | null) => {
      abort.abort();
      window.removeEventListener("message", onMessage);
      channel?.close();
      clearInterval(closedPoll);
      clearTimeout(timeout);
      if (popup && !popup.closed) popup.close();
      resolve(url);
    };

    const onMessage = (event: MessageEvent) => {
      if (popup && event.source !== popup) return;
      if (typeof event.data?.url === "string") finish(event.data.url);
    };
    window.addEventListener("message", onMessage);

    try {
      channel = new BroadcastChannel(OAUTH_CHANNEL);
      channel.onmessage = (event: MessageEvent) => {
        if (typeof event.data?.url === "string") finish(event.data.url);
      };
    } catch {
      // No BroadcastChannel; the other routes still work.
    }

    waitForDeepLinkLogin(pluginId, abort.signal).then((url) => {
      if (url) finish(url);
    });

    // A popup the app can see closing ends the wait. Without one (Android,
    // where the page opens in the system browser) only the timeout does.
    const closedPoll = setInterval(() => {
      if (popup?.closed) finish(null);
    }, 500);
    const timeout = setTimeout(() => finish(null), EXTERNAL_LOGIN_TIMEOUT_MS);
  });
}
