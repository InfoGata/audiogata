import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { db } from "../database";
import { PluginInfo } from "../plugintypes";

/**
 * Storage path convention for native platforms:
 * Directory.Data/plugins/{pluginId}/
 *   script.js       - Plugin JavaScript
 *   options.html    - Options page (optional)
 */

const PLUGINS_DIR = "plugins";

type PluginLargeField = "script" | "optionsHtml";

const FIELD_TO_FILENAME: Record<PluginLargeField, string> = {
  script: "script.js",
  optionsHtml: "options.html",
};

/**
 * Returns true if we should use filesystem storage (on native platforms)
 */
export function isFilesystemStorage(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Get the filesystem path for a plugin field
 */
function getPluginFilePath(pluginId: string, field: PluginLargeField): string {
  return `${PLUGINS_DIR}/${pluginId}/${FIELD_TO_FILENAME[field]}`;
}

/**
 * Ensure the plugins directory exists
 */
async function ensurePluginDir(pluginId: string): Promise<void> {
  try {
    await Filesystem.mkdir({
      path: `${PLUGINS_DIR}/${pluginId}`,
      directory: Directory.Data,
      recursive: true,
    });
  } catch (e) {
    // Directory may already exist
  }
}

/**
 * Write a large field to the filesystem
 */
async function writePluginField(
  pluginId: string,
  field: PluginLargeField,
  content: string
): Promise<void> {
  await ensurePluginDir(pluginId);
  const path = getPluginFilePath(pluginId, field);
  await Filesystem.writeFile({
    path,
    data: content,
    directory: Directory.Data,
    encoding: "utf8" as any,
  });
}

/**
 * Read a large field from the filesystem
 */
async function readPluginField(
  pluginId: string,
  field: PluginLargeField
): Promise<string | undefined> {
  try {
    const path = getPluginFilePath(pluginId, field);
    const result = await Filesystem.readFile({
      path,
      directory: Directory.Data,
      encoding: "utf8" as any,
    });
    return result.data as string;
  } catch {
    return undefined;
  }
}

/**
 * Delete a plugin's files from the filesystem
 */
async function deletePluginFiles(pluginId: string): Promise<void> {
  try {
    await Filesystem.rmdir({
      path: `${PLUGINS_DIR}/${pluginId}`,
      directory: Directory.Data,
      recursive: true,
    });
  } catch {
    // Directory may not exist
  }
}

/**
 * Interface for plugin metadata stored in IndexedDB on native platforms
 * Large fields are stored in filesystem, so we track which ones exist
 */
export interface PluginMetadata extends Omit<PluginInfo, "script" | "optionsHtml"> {
  script: string; // Empty string on native - actual content in filesystem
  hasScript?: boolean;
  hasOptionsHtml?: boolean;
}

/**
 * Save a plugin. On native platforms, large fields are stored in filesystem.
 */
export async function savePlugin(plugin: PluginInfo): Promise<void> {
  if (!isFilesystemStorage()) {
    // Web: Store everything in IndexedDB
    await db.plugins.put(plugin);
    return;
  }

  // Native: Store large fields in filesystem, metadata in IndexedDB
  const pluginId = plugin.id || "";

  // Write large fields to filesystem
  if (plugin.script) {
    await writePluginField(pluginId, "script", plugin.script);
  }
  if (plugin.optionsHtml) {
    await writePluginField(pluginId, "optionsHtml", plugin.optionsHtml);
  }

  // Store metadata in IndexedDB (without large fields)
  const metadata: PluginMetadata = {
    ...plugin,
    script: "", // Empty on native
    hasScript: !!plugin.script,
    hasOptionsHtml: !!plugin.optionsHtml,
  };
  delete (metadata as any).optionsHtml;

  await db.plugins.put(metadata as PluginInfo);
}

/**
 * Load a plugin with all its fields.
 */
export async function loadPlugin(pluginId: string): Promise<PluginInfo | undefined> {
  let metadata: PluginInfo | undefined;

  try {
    metadata = await db.plugins.get(pluginId);
  } catch (e) {
    // Failed to read from IndexedDB (likely large value error)
    // Try to delete the corrupted entry
    console.warn(`Failed to read plugin ${pluginId} from IndexedDB:`, e);
    try {
      await db.plugins.delete(pluginId);
    } catch {
      // Ignore deletion errors
    }
    return undefined;
  }

  if (!metadata) return undefined;

  if (!isFilesystemStorage()) {
    // Web: Everything is in IndexedDB
    return metadata;
  }

  // Native: Load large fields from filesystem
  const plugin: PluginInfo = { ...metadata };

  const nativeMetadata = metadata as PluginMetadata;
  if (nativeMetadata.hasScript) {
    const script = await readPluginField(pluginId, "script");
    if (script) plugin.script = script;
  }
  if (nativeMetadata.hasOptionsHtml) {
    const optionsHtml = await readPluginField(pluginId, "optionsHtml");
    if (optionsHtml) plugin.optionsHtml = optionsHtml;
  }

  return plugin;
}

/**
 * Load all plugins with their full data.
 */
export async function loadAllPlugins(): Promise<PluginInfo[]> {
  if (!isFilesystemStorage()) {
    // Web: Everything is in IndexedDB
    return db.plugins.toArray();
  }

  // Native: Get plugin IDs first, then load each one individually
  // This avoids loading all large values at once which can fail
  let pluginIds: string[];
  try {
    pluginIds = await db.plugins.toCollection().primaryKeys();
  } catch (e) {
    // If we can't even get plugin IDs, the database might be corrupted
    console.warn("Failed to get plugin IDs, clearing plugins table:", e);
    try {
      await db.plugins.clear();
    } catch {
      // Ignore
    }
    return [];
  }

  const plugins: PluginInfo[] = [];

  for (const pluginId of pluginIds) {
    try {
      const plugin = await loadPlugin(pluginId);
      if (plugin) plugins.push(plugin);
    } catch (e) {
      // Skip plugins that fail to load
      console.warn(`Failed to load plugin ${pluginId}:`, e);
    }
  }

  return plugins;
}

/**
 * Load a single field from a plugin (optimized for options pages).
 */
export async function loadPluginField(
  pluginId: string,
  field: PluginLargeField
): Promise<string | undefined> {
  if (!isFilesystemStorage()) {
    // Web: Get from IndexedDB
    const plugin = await db.plugins.get(pluginId);
    return plugin?.[field];
  }

  // Native: Read from filesystem
  return readPluginField(pluginId, field);
}

/**
 * Delete a plugin and its files.
 */
export async function deletePlugin(pluginId: string): Promise<void> {
  await db.plugins.delete(pluginId);

  if (isFilesystemStorage()) {
    await deletePluginFiles(pluginId);
  }
}

/**
 * Migrate existing plugins from IndexedDB to filesystem storage.
 * Only runs on native platforms when plugins have large fields stored in IndexedDB.
 *
 * If reading old data fails (which happens on Android with large values),
 * we clear the problematic plugin data and let users reinstall.
 */
export async function migratePluginsToFilesystem(): Promise<void> {
  if (!isFilesystemStorage()) return;

  try {
    // Get list of plugin IDs first (this should work even if values are too large)
    const pluginIds = await db.plugins.toCollection().primaryKeys();

    for (const pluginId of pluginIds) {
      try {
        const plugin = await db.plugins.get(pluginId);
        if (!plugin) continue;

        const metadata = plugin as PluginMetadata;

        // Check if this plugin needs migration (has actual script content, not empty)
        // If hasScript is already set, this plugin was already migrated
        if (plugin.script && plugin.script.length > 0 && !metadata.hasScript) {
          // Plugin has data in IndexedDB that needs migration
          await writePluginField(pluginId, "script", plugin.script);

          if (plugin.optionsHtml) {
            await writePluginField(pluginId, "optionsHtml", plugin.optionsHtml);
          }

          // Update IndexedDB with metadata only
          const updatedMetadata: PluginMetadata = {
            ...plugin,
            script: "",
            hasScript: !!plugin.script,
            hasOptionsHtml: !!plugin.optionsHtml,
          };
          delete (updatedMetadata as any).optionsHtml;

          await db.plugins.put(updatedMetadata as PluginInfo);
        }
      } catch (e) {
        // Failed to read this plugin (likely "Failed to read large IndexedDB value")
        // Delete the corrupted/unreadable entry so user can reinstall
        console.warn(`Failed to migrate plugin ${pluginId}, removing:`, e);
        try {
          await db.plugins.delete(pluginId);
          await db.pluginAuths.delete(pluginId);
        } catch {
          // Ignore deletion errors
        }
      }
    }
  } catch (e) {
    // If we can't even get the plugin IDs, clear everything
    console.warn("Failed to enumerate plugins for migration, clearing all:", e);
    try {
      await db.plugins.clear();
      await db.pluginAuths.clear();
    } catch {
      // Ignore errors - database might be in a bad state
    }
  }
}
