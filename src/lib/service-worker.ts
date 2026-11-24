import { Capacitor } from "@capacitor/core";

/**
 * The service worker is for the web (and the Electron renderer, which builds
 * with the PWA plugin too). It is registered by hooks/useUpdateServiceWorker,
 * which does nothing in the native app.
 *
 * The native app already loads everything from the device, so a worker adds
 * nothing there. It also gets in the way of over-the-air updates: Capgo swaps
 * the bundle while the origin stays the same, and a worker would keep
 * answering from its precache of the old one. Installs from before this
 * change have a worker registered, so on native it is removed along with its
 * caches. Call once at startup.
 */
export const removeNativeServiceWorker = (): void => {
  if (!Capacitor.isNativePlatform() || !("serviceWorker" in navigator)) return;
  void removeServiceWorker();
};

const removeServiceWorker = async (): Promise<void> => {
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    if (registrations.length === 0) return;
    await Promise.all(registrations.map((r) => r.unregister()));
    // Workbox names its caches `workbox-precache-v2-<scope>` and
    // `workbox-runtime-...`. The app makes no other caches.
    const names = await caches.keys();
    await Promise.all(
      names.filter((n) => n.startsWith("workbox-")).map((n) => caches.delete(n))
    );
  } catch {
    // Not fatal: nothing depends on the worker being gone except a later OTA
    // update, and the next launch tries again.
  }
};
