/**
 * The escape hatch behind AppErrorBoundary. When the app can't get far enough
 * to render anything, the cause is almost always local state rather than the
 * code: a persisted Redux slice written in an older shape, a queue too large
 * to rehydrate, a half-applied Dexie upgrade, a plugin that now throws on load.
 *
 * Two scopes, because AudioDatabase holds things that can't be downloaded
 * again -- playlists, favorites, tracks saved for offline -- and the likeliest
 * culprit, persisted Redux state, can be cleared without touching any of them:
 *
 * - "state": the queue, current track and settings (everything redux-persist
 *   owns)
 * - "all": that, plus every IndexedDB database the app owns
 *
 * The deletion runs on the *next* boot rather than on the click. IndexedDB only
 * completes a `deleteDatabase` once every connection to the database is closed,
 * and by the time the boundary renders Dexie is holding one that nothing
 * reachable from the fallback can close. So the click records the intent and
 * reloads, and the work happens in main.tsx before anything has opened a
 * connection.
 */

export type ResetScope = "state" | "all";

const RESET_FLAG = "audiogata:reset-app-data";

/**
 * Deleted even when `indexedDB.databases()` isn't available to enumerate them
 * (Firefox only shipped it in 126). Keep in sync with src/database.ts.
 */
const KNOWN_DATABASES = ["AudioDatabase"];

/** Everything redux-persist owns; see the persist config in store/store.ts. */
const LOCAL_STORAGE_PREFIX = "persist:";

/** localStorage throws outright when site data is blocked, so every use is guarded. */
const readFlag = (): ResetScope | null => {
  try {
    const value = window.localStorage.getItem(RESET_FLAG);
    return value === "state" || value === "all" ? value : null;
  } catch {
    return null;
  }
};

/**
 * Records the request and reloads. Nothing is deleted here -- see the note
 * above on why that has to wait for the next boot.
 */
export const requestAppDataReset = (scope: ResetScope) => {
  try {
    window.localStorage.setItem(RESET_FLAG, scope);
  } catch {
    // Without storage there is nothing persisted to reset either, so a plain
    // reload is already the whole operation.
  }
  window.location.reload();
};

const deleteDatabase = (name: string) =>
  new Promise<void>((resolve) => {
    const request = indexedDB.deleteDatabase(name);
    // Every outcome resolves, including `blocked`: a reset that can't finish
    // must not be able to stop the app from booting.
    request.onsuccess = request.onerror = request.onblocked = () => resolve();
  });

/**
 * Called once at startup, before anything renders. A no-op unless a reset was
 * requested.
 */
export const runPendingAppDataReset = async (): Promise<void> => {
  const scope = readFlag();
  if (!scope) return;

  // Cleared first, and deliberately before the awaits below: if a deletion
  // hangs or the tab is closed mid-reset, the next boot should start the app
  // rather than sit in a reset loop.
  try {
    window.localStorage.removeItem(RESET_FLAG);
    const persisted = Object.keys(window.localStorage).filter((key) =>
      key.startsWith(LOCAL_STORAGE_PREFIX)
    );
    for (const key of persisted) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // See readFlag.
  }

  if (scope === "all") {
    await Promise.all(KNOWN_DATABASES.map(deleteDatabase));
  }
};
