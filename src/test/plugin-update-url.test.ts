import { afterEach, describe, expect, it, vi } from "vitest";
import { getFileTypeFromPluginUrl, getPlugin } from "@/utils";

const INSTALLED_FROM =
  "https://cdn.jsdelivr.net/gh/InfoGata/soundcloud-audiogata@latest/manifest.json";

const manifest = (updateUrl?: string) => ({
  id: "soundcloud",
  name: "Plugin for SoundCloud",
  version: "1.2.0",
  script: "index.js",
  ...(updateUrl ? { updateUrl } : {}),
});

// getFileText derives every file url from the manifest url, so one stub covers
// both the manifest and the script it names.
const serve = (body: object) => {
  const fetchMock = vi.fn(async (url: string) =>
    url.endsWith("manifest.json")
      ? new Response(JSON.stringify(body))
      : new Response("// plugin script")
  );
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

afterEach(() => vi.unstubAllGlobals());

describe("fetching plugin files", () => {
  it("revalidates instead of trusting a cached copy", async () => {
    // jsdelivr caches the mutable refs in the browser for a week, so a plain
    // fetch can answer an update check with a build from seven days ago.
    const fetchMock = serve(manifest());

    await getPlugin(getFileTypeFromPluginUrl(INSTALLED_FROM));

    expect(fetchMock.mock.calls.length).toBeGreaterThan(1);
    // The manifest and the script are separate cache entries; both have to be
    // fresh or a version can be paired with code that isn't it.
    for (const call of fetchMock.mock.calls) {
      const init = (call as unknown[])[1] as RequestInit;
      expect(init.cache).toBe("no-cache");
    }
  });
});

describe("where the next update is fetched from", () => {
  it("takes the url the new manifest asks for", async () => {
    // This is what lets a plugin be moved to another host. Without it every
    // installed copy asks its original url forever.
    const moved = "https://example.com/soundcloud/manifest.json";
    serve(manifest(moved));

    const plugin = await getPlugin(getFileTypeFromPluginUrl(INSTALLED_FROM));

    expect(plugin?.manifestUrl).toBe(moved);
  });

  it("keeps the url it was fetched from when the manifest names none", async () => {
    // The fallback the update paths rely on: a manifest that says nothing about
    // updates must not lose the channel it already had.
    serve(manifest());

    const plugin = await getPlugin(getFileTypeFromPluginUrl(INSTALLED_FROM));

    expect(plugin?.manifestUrl).toBe(INSTALLED_FROM);
  });
});
