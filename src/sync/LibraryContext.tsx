import type { DocHandle } from "@automerge/automerge-repo";
import React from "react";
import usePlugins from "@/hooks/usePlugins";
import { useAppSelector } from "@/store/hooks";
import { defaultCloudSync } from "@/store/reducers/settingsReducer";
import { CloudSyncManager } from "./cloud/CloudSyncManager";
import { PluginSyncProviderAdapter } from "./cloud/PluginSyncProviderAdapter";
import { getLibraryHandle, getLibraryRepo } from "./library";
import { isLibraryDoc, type LibraryDoc } from "./library-doc";

/** Name of the file sync plugins keep the library in. */
export const LIBRARY_SYNC_FILE = "audiogata-library";

// eslint-disable-next-line react-refresh/only-export-components
export const cloudSyncManager = new CloudSyncManager<LibraryDoc>();

// eslint-disable-next-line react-refresh/only-export-components
export const LibraryContext = React.createContext<LibraryDoc | null>(null);

/**
 * Makes the library document available to components, and keeps it synced
 * with the plugin chosen in Settings. Renders nothing until the document has
 * been read from IndexedDB, which is quick and happens once.
 */
export const LibraryProvider: React.FC<React.PropsWithChildren> = (props) => {
  const [handle, setHandle] = React.useState<DocHandle<LibraryDoc>>();
  const [error, setError] = React.useState<unknown>();

  React.useEffect(() => {
    getLibraryHandle().then(setHandle, setError);
  }, []);

  const subscribe = React.useCallback(
    (onChange: () => void) => {
      handle?.on("change", onChange);
      return () => {
        handle?.off("change", onChange);
      };
    },
    [handle]
  );
  const doc = React.useSyncExternalStore(subscribe, () => handle?.doc());

  useCloudSync(handle);

  // Let AppErrorBoundary offer a reset rather than leave a blank page.
  if (error) throw error;
  if (!doc) return null;

  return (
    <LibraryContext.Provider value={doc}>{props.children}</LibraryContext.Provider>
  );
};

function useCloudSync(handle: DocHandle<LibraryDoc> | undefined) {
  const cloudSync = useAppSelector(
    (state) => state.settings.cloudSync ?? defaultCloudSync
  );
  const { plugins, pluginsLoaded } = usePlugins();
  const plugin = plugins.find((p) => p.id === cloudSync.pluginId);

  React.useEffect(() => {
    if (!handle || !pluginsLoaded || !plugin) {
      cloudSyncManager.configure(null);
      return;
    }
    let cancelled = false;
    const setup = async () => {
      const canSync =
        (await plugin.hasDefined.onSyncUpload()) &&
        (await plugin.hasDefined.onSyncDownload());
      if (cancelled) return;
      cloudSyncManager.configure(
        canSync
          ? {
              provider: new PluginSyncProviderAdapter(plugin),
              repo: getLibraryRepo(),
              handle,
              docUrl: LIBRARY_SYNC_FILE,
              isValidRemote: isLibraryDoc,
              autoSync: cloudSync.autoSync,
              intervalMs: cloudSync.syncIntervalSeconds * 1000,
              lockName: "audiogata-cloud-sync",
            }
          : null
      );
    };
    setup();
    return () => {
      cancelled = true;
      cloudSyncManager.configure(null);
    };
  }, [
    handle,
    plugin,
    pluginsLoaded,
    cloudSync.autoSync,
    cloudSync.syncIntervalSeconds,
  ]);
}
