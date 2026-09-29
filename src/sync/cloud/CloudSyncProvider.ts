export type SyncStatus = "idle" | "syncing" | "error" | "success";

/**
 * Somewhere to keep one copy of a document: a sync plugin, or a fake in tests.
 * It only stores bytes. Merging happens in CloudSyncManager.
 */
export interface CloudSyncProvider {
  upload(docUrl: string, data: Uint8Array): Promise<void>;
  /** Null when nothing has been uploaded yet. */
  download(docUrl: string): Promise<Uint8Array | null>;
}

export class CloudSyncError extends Error {
  constructor(
    message: string,
    public readonly pluginId?: string
  ) {
    super(message);
    this.name = "CloudSyncError";
  }
}
