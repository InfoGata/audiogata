import { useLiveQuery } from "dexie-react-hooks";
import React from "react";
import { db } from "../database";
import { PluginInfo } from "../plugintypes";
import {
  isFilesystemStorage,
  loadPlugin,
  loadPluginField,
} from "../storage/pluginStorage";

/**
 * Hook that provides reactive plugin info with support for filesystem storage on native platforms.
 * On web, uses Dexie's live query for reactivity.
 * On native, combines Dexie reactivity (for metadata) with filesystem reads (for large fields).
 */
export function usePluginInfo(pluginId: string): PluginInfo | undefined {
  const isNative = isFilesystemStorage();

  // Use Dexie live query for metadata/web
  const dexiePlugin = useLiveQuery(() => db.plugins.get(pluginId || ""), [pluginId]);

  // On native, we need to load the full plugin data from filesystem
  const [nativePlugin, setNativePlugin] = React.useState<PluginInfo | undefined>();

  React.useEffect(() => {
    if (!isNative || !pluginId) return;

    const loadFullPlugin = async () => {
      const plugin = await loadPlugin(pluginId);
      setNativePlugin(plugin);
    };

    loadFullPlugin();
  }, [isNative, pluginId, dexiePlugin]); // Re-run when dexiePlugin changes

  return isNative ? nativePlugin : dexiePlugin;
}

/**
 * Hook to get just the script size for display purposes
 */
export function usePluginScriptSize(pluginId: string): number {
  const isNative = isFilesystemStorage();
  const [size, setSize] = React.useState(0);

  // Web: use live query
  const dexiePlugin = useLiveQuery(
    () => (isNative ? undefined : db.plugins.get(pluginId || "")),
    [pluginId, isNative]
  );

  React.useEffect(() => {
    if (isNative && pluginId) {
      loadPluginField(pluginId, "script").then((script) => {
        if (script) {
          setSize(new Blob([script]).size);
        }
      });
    } else if (dexiePlugin?.script) {
      setSize(new Blob([dexiePlugin.script]).size);
    }
  }, [isNative, pluginId, dexiePlugin]);

  return size;
}

/**
 * Hook to get just the options HTML size for display purposes
 */
export function usePluginOptionsSize(pluginId: string): number {
  const isNative = isFilesystemStorage();
  const [size, setSize] = React.useState(0);

  const dexiePlugin = useLiveQuery(
    () => (isNative ? undefined : db.plugins.get(pluginId || "")),
    [pluginId, isNative]
  );

  React.useEffect(() => {
    if (isNative && pluginId) {
      loadPluginField(pluginId, "optionsHtml").then((html) => {
        if (html) {
          setSize(new Blob([html]).size);
        }
      });
    } else if (dexiePlugin?.optionsHtml) {
      setSize(new Blob([dexiePlugin.optionsHtml]).size);
    }
  }, [isNative, pluginId, dexiePlugin]);

  return size;
}
