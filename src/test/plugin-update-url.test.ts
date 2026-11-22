import { afterEach, describe, expect, it, vi } from "vitest";
import { getFileTypeFromPluginUrl, getPinnedFileType, getPlugin } from "@/utils";

const INSTALLED_FROM =
  "https://cdn.jsdelivr.net/gh/InfoGata/soundcloud-audiogata@latest/manifest.json";

const manifest = (updateUrl?: string) => ({
  id: "soundcloud",
  name: "Plugin for SoundCloud",
  version: "1.2.0",
  script: "index.js",
  ...(updateUrl ? { updateUrl } : {}),
});

// The manifest url is the moving ref; any other url on the same repo is a
// file of the release, pinned (`@<version>`) or not.
const serve = (body: object, { pinnedStatus = 200 } = {}) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      if (url.endsWith("manifest.json")) return new Response(JSON.stringify(body));
      if (/@\d/.test(url) && pinnedStatus !== 200) {
        return new Response("not found", { status: pinnedStatus });
      }
      return new Response("// plugin script");
    })
  );

const fetchCalls = () =>
  (globalThis.fetch as unknown as { mock: { calls: [string, RequestInit?][] } })
    .mock.calls;

afterEach(() => vi.unstubAllGlobals());

describe("fetching plugin files", () => {
  it("revalidates the manifest instead of trusting a cached copy", async () => {
    // jsdelivr caches the mutable refs in the browser for a week, so a plain
    // fetch can answer an update check with a build from seven days ago.
    serve(manifest());

    await getPlugin(getFileTypeFromPluginUrl(INSTALLED_FROM));

    const [, init] = fetchCalls().find(([url]) => url.endsWith("manifest.json"))!;
    expect(init?.cache).toBe("no-cache");
  });

  it("revalidates the script when it can't be pinned to a release", async () => {
    serve(manifest());

    await getPlugin(getFileTypeFromPluginUrl("https://example.com/plugin/manifest.json"));

    const [url, init] = fetchCalls().find(([url]) => url.endsWith("index.js"))!;
    expect(url).toBe("https://example.com/plugin/index.js");
    expect(init?.cache).toBe("no-cache");
  });
});

describe("pinning a release's files to its version", () => {
  it("fetches the script from the tag the manifest names", async () => {
    // The manifest comes from the moving ref, but jsdelivr caches each url on
    // its own: after a release an edge can pair the new manifest with the old
    // script. A tagged url can only be that release's build.
    serve(manifest());

    const plugin = await getPlugin(getFileTypeFromPluginUrl(INSTALLED_FROM));

    expect(fetchCalls().map(([url]) => url)).toEqual([
      INSTALLED_FROM,
      "https://cdn.jsdelivr.net/gh/InfoGata/soundcloud-audiogata@1.2.0/index.js",
    ]);
    expect(plugin?.script).toBe("// plugin script");
  });

  it("falls back to the moving ref when the release isn't tagged", async () => {
    serve(manifest(), { pinnedStatus: 404 });

    const plugin = await getPlugin(getFileTypeFromPluginUrl(INSTALLED_FROM));

    expect(fetchCalls().map(([url]) => url)).toEqual([
      INSTALLED_FROM,
      "https://cdn.jsdelivr.net/gh/InfoGata/soundcloud-audiogata@1.2.0/index.js",
      "https://cdn.jsdelivr.net/gh/InfoGata/soundcloud-audiogata@latest/index.js",
    ]);
    expect(plugin?.script).toBe("// plugin script");
  });

  it("gives up rather than fall back when the tagged url fails otherwise", async () => {
    // Falling back on any error would bring the mismatch back; a missed
    // update is just tried again next time.
    serve(manifest(), { pinnedStatus: 503 });

    const plugin = await getPlugin(getFileTypeFromPluginUrl(INSTALLED_FROM));

    expect(plugin).toBeNull();
    expect(fetchCalls()).toHaveLength(2);
  });

  it("pins only jsdelivr GitHub urls on a moving ref", () => {
    const pin = (url: string, version = "1.8.1") =>
      getPinnedFileType(getFileTypeFromPluginUrl(url), version)?.url?.url;
    const gh = "https://cdn.jsdelivr.net/gh/InfoGata/imageboard-socialgata";

    expect(pin(`${gh}@latest/manifest.json`)).toBe(`${gh}@1.8.1/manifest.json`);
    expect(pin(`${gh}@master/manifest.json`)).toBe(`${gh}@1.8.1/manifest.json`);
    expect(pin(`${gh}/manifest.json`)).toBe(`${gh}@1.8.1/manifest.json`);
    // Already a fixed build.
    expect(pin(`${gh}@1.7.0/manifest.json`)).toBeUndefined();
    expect(pin(`${gh}@v1.7.0/manifest.json`)).toBeUndefined();
    expect(pin(`${gh}@1aca9e2/manifest.json`)).toBeUndefined();
    // Not jsdelivr GitHub, or no usable version.
    expect(pin("http://localhost:8080/manifest.json")).toBeUndefined();
    expect(pin("https://cdn.jsdelivr.net/npm/some-plugin@latest/manifest.json")).toBeUndefined();
    expect(pin(`${gh}@latest/manifest.json`, "next")).toBeUndefined();
  });
});

describe("where the next update is fetched from", () => {
  it("takes the url the new manifest asks for", async () => {
    // This is what lets a plugin be moved to another host. Without it every
    // installed copy asks its original url forever, and a dead url can never be
    // redirected remotely.
    const moved = "https://example.com/plugin/manifest.json";
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
