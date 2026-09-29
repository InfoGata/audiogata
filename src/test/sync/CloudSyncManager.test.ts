import * as A from "@automerge/automerge";
import { Repo } from "@automerge/automerge-repo";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CloudSyncManager } from "@/sync/cloud/CloudSyncManager";
import type { CloudSyncProvider } from "@/sync/cloud/CloudSyncProvider";
import {
  GENESIS_HEADS,
  genesisBytes,
  isLibraryDoc,
  type LibraryDoc,
} from "@/sync/library-doc";
import * as ops from "@/sync/library-ops";

class MemoryProvider implements CloudSyncProvider {
  files = new Map<string, Uint8Array>();
  uploads = 0;
  async upload(docUrl: string, data: Uint8Array) {
    this.uploads++;
    this.files.set(docUrl, data);
  }
  async download(docUrl: string) {
    return this.files.get(docUrl) ?? null;
  }
}

const managers: CloudSyncManager<LibraryDoc>[] = [];

const device = (provider: CloudSyncProvider, autoSync = false) => {
  const repo = new Repo({ network: [] });
  const handle = repo.import<LibraryDoc>(genesisBytes());
  const manager = new CloudSyncManager<LibraryDoc>();
  managers.push(manager);
  manager.configure({
    provider,
    repo,
    handle,
    docUrl: "audiogata-library",
    isValidRemote: isLibraryDoc,
    autoSync,
    intervalMs: 60_000,
    lockName: "test",
  });
  return { repo, handle, manager };
};

afterEach(() => {
  managers.forEach((m) => m.configure(null));
  managers.length = 0;
  vi.useRealTimers();
});

describe("genesis", () => {
  it("has the heads the app was built with", () => {
    expect(A.getHeads(A.load(genesisBytes()))).toEqual(GENESIS_HEADS);
  });

  it("keeps both devices' playlists when they merge", () => {
    let a = A.load<LibraryDoc>(genesisBytes());
    let b = A.load<LibraryDoc>(genesisBytes());
    a = A.change(a, (d) => void ops.addPlaylist(d, { name: "A", tracks: [] }));
    b = A.change(b, (d) => void ops.addPlaylist(d, { name: "B", tracks: [] }));
    const merged = A.merge(a, b);
    const names = Object.values(merged.playlists).map((p) => p.name);
    expect(names.sort()).toEqual(["A", "B"]);
  });
});

describe("CloudSyncManager", () => {
  it("brings two devices to the same library", async () => {
    const provider = new MemoryProvider();
    const a = device(provider);
    const b = device(provider);

    a.handle.change((d) => void ops.addPlaylist(d, { name: "Mine", tracks: [] }));
    b.handle.change((d) =>
      ops.addFavorites(d, "tracks", [{ name: "Song", pluginId: "p", apiId: "1" }])
    );
    await a.manager.syncNow();
    await b.manager.syncNow();
    await a.manager.syncNow();

    for (const { handle } of [a, b]) {
      const doc = handle.doc();
      expect(Object.values(doc.playlists).map((p) => p.name)).toEqual(["Mine"]);
      expect(Object.keys(doc.favorites.tracks)).toEqual(["p:1"]);
    }
  });

  it("doesn't bring back something deleted on another device", async () => {
    const provider = new MemoryProvider();
    const a = device(provider);
    const b = device(provider);

    a.handle.change((d) => void ops.addPlaylist(d, { name: "Old", tracks: [] }));
    await a.manager.syncNow();
    await b.manager.syncNow();
    const [id] = Object.keys(b.handle.doc().playlists);

    b.handle.change((d) => ops.deletePlaylist(d, id));
    await b.manager.syncNow();
    await a.manager.syncNow();
    await b.manager.syncNow();

    expect(a.handle.doc().playlists).toEqual({});
    expect(b.handle.doc().playlists).toEqual({});
  });

  it("skips the upload when the cloud copy is already up to date", async () => {
    const provider = new MemoryProvider();
    const a = device(provider);
    a.handle.change((d) => void ops.addPlaylist(d, { name: "x", tracks: [] }));
    await a.manager.syncNow();
    await a.manager.syncNow();
    expect(provider.uploads).toBe(1);
  });

  it("refuses a cloud copy that doesn't share the genesis", async () => {
    const provider = new MemoryProvider();
    provider.files.set(
      "audiogata-library",
      A.save(A.from<Record<string, unknown>>({ playlists: {} }))
    );
    const a = device(provider);
    await a.manager.syncNow();
    expect(a.manager.getState().status).toBe("error");
    expect(provider.uploads).toBe(0);
  });

  it("syncs a while after a local edit when auto sync is on", async () => {
    vi.useFakeTimers();
    const provider = new MemoryProvider();
    const a = device(provider, true);
    await vi.advanceTimersByTimeAsync(0);
    const before = provider.uploads;

    a.handle.change((d) => void ops.addPlaylist(d, { name: "x", tracks: [] }));
    await vi.advanceTimersByTimeAsync(6000);
    expect(provider.uploads).toBe(before + 1);
  });

  it("stops syncing once turned off", async () => {
    vi.useFakeTimers();
    const provider = new MemoryProvider();
    const a = device(provider, true);
    await vi.advanceTimersByTimeAsync(0);
    a.manager.configure(null);
    const before = provider.uploads;

    a.handle.change((d) => void ops.addPlaylist(d, { name: "x", tracks: [] }));
    await vi.advanceTimersByTimeAsync(10 * 60_000);
    expect(provider.uploads).toBe(before);
  });
});

describe("library ops", () => {
  const withPlaylist = () => {
    let doc = A.load<LibraryDoc>(genesisBytes());
    let id = "";
    doc = A.change(doc, (d) => {
      id = ops.addPlaylist(d, {
        name: "p",
        tracks: [
          { id: "1", name: "one" },
          { id: "2", name: "two" },
          { id: "3", name: "three" },
        ],
      });
    });
    return { doc, id };
  };

  it("merges tracks added and removed on two devices", () => {
    const { doc, id } = withPlaylist();
    const a = A.change(A.clone(doc), (d) =>
      ops.addPlaylistTracks(d, id, [{ id: "4", name: "four" }])
    );
    const b = A.change(A.clone(doc), (d) =>
      ops.setPlaylistTracks(d, id, [
        { id: "1", name: "one" },
        { id: "3", name: "three" },
      ])
    );
    const merged = A.merge(a, b);
    expect(merged.playlists[id].tracks.map((t) => t.id)).toEqual(["1", "3", "4"]);
  });

  it("reorders tracks", () => {
    const { doc, id } = withPlaylist();
    const next = A.change(doc, (d) =>
      ops.setPlaylistTracks(d, id, [
        { id: "3", name: "three" },
        { id: "1", name: "one" },
        { id: "2", name: "two (edited)" },
      ])
    );
    expect(next.playlists[id].tracks).toEqual([
      { id: "3", name: "three" },
      { id: "1", name: "one" },
      { id: "2", name: "two (edited)" },
    ]);
  });

  it("stores a favorite once however many devices add it", () => {
    let a = A.load<LibraryDoc>(genesisBytes());
    let b = A.load<LibraryDoc>(genesisBytes());
    const album = { name: "LP", pluginId: "p", apiId: "9", artistName: undefined };
    a = A.change(a, (d) => ops.addFavorites(d, "albums", [{ ...album, id: "a" }]));
    b = A.change(b, (d) => ops.addFavorites(d, "albums", [{ ...album, id: "b" }]));
    const merged = A.merge(a, b);
    expect(Object.keys(merged.favorites.albums)).toEqual(["p:9"]);
    expect(ops.isFavorite(merged, "albums", album)).toBe(true);
  });
});
