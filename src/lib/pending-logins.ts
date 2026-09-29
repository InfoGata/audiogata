/**
 * Sign-ins the app started on a plugin's behalf and is waiting to finish. On
 * Android the OAuth page opens outside the app and comes back as a deep link
 * (see public/login_popup.html), which PluginsContext hands here first.
 */
const pending = new Map<string, (url: string) => void>();

/** Resolves with the callback url once a deep link for this plugin arrives. */
export const waitForDeepLinkLogin = (
  pluginId: string,
  signal: AbortSignal
): Promise<string | null> =>
  new Promise((resolve) => {
    const done = (url: string | null) => {
      if (pending.get(pluginId) === onUrl) pending.delete(pluginId);
      resolve(url);
    };
    const onUrl = (url: string) => done(url);
    pending.set(pluginId, onUrl);
    signal.addEventListener("abort", () => done(null), { once: true });
  });

/** True when the url finished a pending sign-in. */
export const resolvePendingLogin = (pluginId: string, url: string): boolean => {
  const resolve = pending.get(pluginId);
  if (!resolve) return false;
  resolve(url);
  return true;
};
