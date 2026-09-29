import * as A from "@automerge/automerge";
import type { DocHandle, Repo } from "@automerge/automerge-repo";
import {
  CloudSyncError,
  type CloudSyncProvider,
  type SyncStatus,
} from "./CloudSyncProvider";

export interface SyncConfig<T> {
  provider: CloudSyncProvider;
  repo: Repo;
  handle: DocHandle<T>;
  /** Name of the file the provider keeps the document in. */
  docUrl: string;
  /** Rejects a cloud copy this document can't be merged with. */
  isValidRemote: (doc: A.Doc<unknown>) => boolean;
  /**
   * Runs when the cloud has no copy yet, before the first upload -- the place
   * to bring in data from an older format stored elsewhere.
   */
  onNoRemote?: (provider: CloudSyncProvider) => Promise<void>;
  /** Sync on local edits, on a timer and when the app is hidden or shown. */
  autoSync: boolean;
  intervalMs: number;
  /** Web lock name, so only one tab syncs at a time. */
  lockName: string;
}

export interface SyncState {
  status: SyncStatus;
  lastSyncTime: Date | null;
  lastError: Error | null;
}

/** How long after a local edit to sync, so a burst of edits is one upload. */
export const CHANGE_DEBOUNCE_MS = 5000;
const MAX_BACKOFF_MS = 10 * 60 * 1000;

const sameHeads = (a: string[] | null, b: string[]) =>
  !!a && a.length === b.length && [...a].sort().join() === [...b].sort().join();

/**
 * Keeps a document in step with a copy in cloud storage.
 *
 * A sync downloads the cloud copy, merges it into the local document with
 * automerge, and uploads the result if the cloud copy was missing anything.
 * The cloud file is simply overwritten, so two devices uploading at once
 * leaves one of their versions there -- but each still has its own changes
 * locally and puts them back on its next sync, so they converge.
 */
export class CloudSyncManager<T> {
  private config: SyncConfig<T> | null = null;
  private state: SyncState = { status: "idle", lastSyncTime: null, lastError: null };
  private listeners = new Set<(state: SyncState) => void>();
  private running: Promise<void> | null = null;
  private lastSyncedHeads: string[] | null = null;
  private failures = 0;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private debounce: ReturnType<typeof setTimeout> | null = null;
  private teardown: (() => void)[] = [];

  /**
   * Start syncing with this configuration, replacing any previous one, or stop
   * with null. Safe to call repeatedly: every call first undoes the last.
   */
  configure(config: SyncConfig<T> | null) {
    this.stop();
    this.config = config;
    this.failures = 0;
    this.lastSyncedHeads = null;
    if (!config) {
      this.setState({ status: "idle", lastError: null });
      return;
    }
    if (!config.autoSync) return;

    const onChange = () => this.scheduleChangeSync();
    config.handle.on("change", onChange);
    this.teardown.push(() => config.handle.off("change", onChange));

    if (typeof document !== "undefined") {
      // Hidden is often the last chance before the app is closed or frozen;
      // visible is when another device has most likely changed something.
      const onVisibility = () => void this.syncNow();
      document.addEventListener("visibilitychange", onVisibility);
      this.teardown.push(() =>
        document.removeEventListener("visibilitychange", onVisibility)
      );
    }
    if (typeof window !== "undefined") {
      const onOnline = () => void this.syncNow();
      window.addEventListener("online", onOnline);
      this.teardown.push(() => window.removeEventListener("online", onOnline));
    }

    void this.syncNow();
  }

  stop() {
    this.teardown.forEach((fn) => fn());
    this.teardown = [];
    if (this.timer) clearTimeout(this.timer);
    if (this.debounce) clearTimeout(this.debounce);
    this.timer = null;
    this.debounce = null;
    this.config = null;
  }

  getState(): SyncState {
    return this.state;
  }

  subscribe(listener: (state: SyncState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Sync now. Resolves once done; joins a sync already in progress. */
  syncNow(): Promise<void> {
    if (!this.config) return Promise.resolve();
    if (!this.running) {
      const config = this.config;
      this.running = this.withLock(config, () => this.sync(config)).finally(() => {
        this.running = null;
        this.scheduleNext(config);
      });
    }
    return this.running;
  }

  private scheduleChangeSync() {
    const config = this.config;
    if (!config) return;
    if (sameHeads(this.lastSyncedHeads, A.getHeads(config.handle.doc()))) return;
    if (this.debounce) clearTimeout(this.debounce);
    this.debounce = setTimeout(() => {
      this.debounce = null;
      void this.syncNow();
    }, CHANGE_DEBOUNCE_MS);
  }

  private scheduleNext(config: SyncConfig<T>) {
    if (this.config !== config || !config.autoSync) return;
    if (this.timer) clearTimeout(this.timer);
    const delay = Math.min(
      config.intervalMs * 2 ** this.failures,
      Math.max(config.intervalMs, MAX_BACKOFF_MS)
    );
    this.timer = setTimeout(() => {
      this.timer = null;
      void this.syncNow();
    }, delay);
  }

  private async withLock(config: SyncConfig<T>, fn: () => Promise<void>) {
    const locks = typeof navigator !== "undefined" ? navigator.locks : undefined;
    if (!locks) return fn();
    // Another tab already syncing will pick up this tab's changes too: they
    // share the document through the repo's BroadcastChannel.
    await locks.request(config.lockName, { ifAvailable: true }, async (lock) => {
      if (lock) await fn();
    });
  }

  private async sync(config: SyncConfig<T>) {
    this.setState({ status: "syncing" });
    try {
      const { provider, repo, handle, docUrl } = config;
      const remoteBytes = await provider.download(docUrl);
      let remoteHeads: string[] | null = null;
      if (remoteBytes) {
        const remote = A.load(remoteBytes);
        if (!config.isValidRemote(remote)) {
          throw new CloudSyncError(
            "The copy in cloud storage isn't a library this app can merge with"
          );
        }
        remoteHeads = A.getHeads(remote);
        // Merges into the existing handle (loadIncremental under the hood).
        repo.import(remoteBytes, { docId: handle.documentId });
      } else {
        await config.onNoRemote?.(provider);
      }
      // A.getHeads, not handle.heads(): the handle's are url-encoded.
      const heads = A.getHeads(handle.doc());
      if (!sameHeads(remoteHeads, heads)) {
        await provider.upload(docUrl, A.save(handle.doc()));
      }
      if (this.config !== config) return;
      this.lastSyncedHeads = heads;
      this.failures = 0;
      this.setState({ status: "success", lastSyncTime: new Date(), lastError: null });
    } catch (e) {
      if (this.config !== config) return;
      this.failures++;
      const error = e instanceof Error ? e : new CloudSyncError(String(e));
      console.error("Cloud sync failed", error);
      this.setState({ status: "error", lastError: error });
    }
  }

  private setState(partial: Partial<SyncState>) {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((l) => l(this.state));
  }
}
