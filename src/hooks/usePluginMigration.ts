import React from "react";
import {
  isFilesystemStorage,
  migratePluginsToFilesystem,
} from "../storage/pluginStorage";

interface UsePluginMigrationResult {
  migrationComplete: boolean;
  migrationError: Error | null;
}

/**
 * Hook that runs migration on app startup to move existing plugins
 * from IndexedDB to filesystem storage on native platforms.
 */
export function usePluginMigration(): UsePluginMigrationResult {
  const [migrationComplete, setMigrationComplete] = React.useState(
    // On web, no migration needed
    !isFilesystemStorage()
  );
  const [migrationError, setMigrationError] = React.useState<Error | null>(null);
  const migrationStarted = React.useRef(false);

  React.useEffect(() => {
    const runMigration = async () => {
      if (!isFilesystemStorage() || migrationStarted.current) {
        return;
      }

      migrationStarted.current = true;

      try {
        await migratePluginsToFilesystem();
        setMigrationComplete(true);
      } catch (e) {
        console.error("Plugin migration failed:", e);
        setMigrationError(e instanceof Error ? e : new Error(String(e)));
        // Still mark as complete so app can try to proceed
        setMigrationComplete(true);
      }
    };

    runMigration();
  }, []);

  return { migrationComplete, migrationError };
}
