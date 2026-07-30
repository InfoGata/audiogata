import { beforeEach, describe, expect, it } from "vitest";
import {
  aliasForId,
  aliasFromName,
  assignAlias,
  normalizeAlias,
  resolvePluginParam,
  setPluginAliases,
  validateAlias,
} from "@/lib/plugin-alias";
import { pluginContentPath, toContentPath } from "@/lib/plugin-route";

describe("normalizeAlias", () => {
  it("slugifies plugin names", () => {
    expect(normalizeAlias("Plugin for SoundCloud")).toBe("plugin-for-soundcloud");
    expect(normalizeAlias("  Google_Drive  ")).toBe("google-drive");
    expect(normalizeAlias("4chan!!")).toBe("4chan");
  });

  it("never produces a leading or trailing dash", () => {
    expect(normalizeAlias("--youtube--")).toBe("youtube");
    expect(normalizeAlias("!!!")).toBe("");
    // Clamping must not leave the dash the cut lands on.
    expect(normalizeAlias(`${"a".repeat(31)}-bcdef`)).toBe("a".repeat(31));
  });
});

describe("aliasFromName", () => {
  it("drops the boilerplate AudioGata plugins are named with", () => {
    expect(aliasFromName("Plugin for Youtube")).toBe("youtube");
    expect(aliasFromName("Plugin for SoundCloud")).toBe("soundcloud");
    expect(aliasFromName("Plugin for Google Drive")).toBe("google-drive");
    expect(aliasFromName("Plugin for Azlyrics")).toBe("azlyrics");
  });

  it("also drops boilerplate written as a suffix", () => {
    expect(aliasFromName("Youtube Plugin for AudioGata")).toBe("youtube");
    expect(aliasFromName("Dropbox Sync Plugin")).toBe("dropbox-sync");
  });

  it("keeps a plain name untouched", () => {
    expect(aliasFromName("Spotify")).toBe("spotify");
  });

  it("keeps the whole name when cutting would leave nothing", () => {
    expect(aliasFromName("Plugin")).toBe("plugin");
    expect(aliasFromName("Plugins")).toBe("plugins");
  });
});

describe("validateAlias", () => {
  const plugins = [
    { id: "5WWSzBORLfZgym533u87I", alias: "youtube" },
    { id: "B9-GwavJJOQpQXotpLZH", alias: "soundcloud" },
    // Generated ids are mixed-case nanoids, but `Manifest.id` is free-form, so
    // a hand-authored plugin can ship an id that is itself a legal alias.
    { id: "radio", alias: "internet-radio" },
  ];

  it("accepts a free, normalized alias", () => {
    expect(validateAlias("spotify", plugins)).toBeNull();
  });

  it("rejects unnormalized input", () => {
    expect(validateAlias("Youtube Two", plugins)).toBe("invalid");
  });

  it("rejects one character aliases", () => {
    expect(validateAlias("y", plugins)).toBe("tooShort");
  });

  it("rejects an alias that is some plugin's id", () => {
    // Taking this would make the radio plugin's own id url resolve to
    // whichever plugin claimed it.
    expect(validateAlias("radio", plugins)).toBe("isPluginId");
  });

  it("rejects a generated plugin id as unnormalized first", () => {
    // Generated ids are mixed-case, so they can't be typed as an alias at all.
    expect(validateAlias("5WWSzBORLfZgym533u87I", plugins)).toBe("invalid");
  });

  it("rejects an alias another plugin holds", () => {
    expect(validateAlias("youtube", plugins)).toBe("taken");
  });

  it("allows a plugin to keep its own alias", () => {
    expect(validateAlias("youtube", plugins, "5WWSzBORLfZgym533u87I")).toBeNull();
  });
});

describe("assignAlias", () => {
  it("hands out the requested alias when free", () => {
    expect(assignAlias("spotify", [{ id: "a", alias: "youtube" }])).toBe(
      "spotify"
    );
  });

  it("dedupes with a numeric suffix rather than failing", () => {
    const plugins = [{ id: "a", alias: "youtube" }];
    expect(assignAlias("youtube", plugins)).toBe("youtube-2");

    plugins.push({ id: "b", alias: "youtube-2" });
    expect(assignAlias("youtube", plugins)).toBe("youtube-3");
  });

  it("normalizes what it was given", () => {
    expect(assignAlias("Google Drive", [])).toBe("google-drive");
  });

  it("returns undefined when nothing usable is left", () => {
    expect(assignAlias("!", [])).toBeUndefined();
  });

  it("keeps a deduped alias within the length limit", () => {
    const base = "a".repeat(32);
    const alias = assignAlias(base, [{ id: "a", alias: base }]);
    expect(alias).toBe(`${"a".repeat(30)}-2`);
    expect(alias!.length).toBeLessThanOrEqual(32);
  });
});

describe("the alias registry", () => {
  beforeEach(() => {
    setPluginAliases([
      { id: "5WWSzBORLfZgym533u87I", alias: "youtube" },
      { id: "B9-GwavJJOQpQXotpLZH", alias: "soundcloud" },
    ]);
  });

  it("maps an alias to its plugin id", () => {
    expect(resolvePluginParam("youtube")).toBe("5WWSzBORLfZgym533u87I");
  });

  it("passes a plugin id through unchanged, so old urls keep working", () => {
    expect(resolvePluginParam("5WWSzBORLfZgym533u87I")).toBe(
      "5WWSzBORLfZgym533u87I"
    );
  });

  it("passes an unknown segment through rather than guessing", () => {
    expect(resolvePluginParam("spotify")).toBe("spotify");
  });

  it("falls back to the base name for an alias that deduped elsewhere", () => {
    // A url shared from a device that had two youtube plugins.
    expect(resolvePluginParam("youtube-2")).toBe("5WWSzBORLfZgym533u87I");
  });

  it("prefers the lowest suffix when several share a base name", () => {
    setPluginAliases([
      { id: "second", alias: "youtube-3" },
      { id: "first", alias: "youtube-2" },
    ]);
    expect(resolvePluginParam("youtube")).toBe("first");
  });

  it("maps a plugin id back to its alias", () => {
    expect(aliasForId("5WWSzBORLfZgym533u87I")).toBe("youtube");
  });

  it("leaves an id without an alias alone", () => {
    expect(aliasForId("unknown-id")).toBe("unknown-id");
  });

  it("drops plugins with no alias", () => {
    setPluginAliases([{ id: "no-alias" }]);
    expect(aliasForId("no-alias")).toBe("no-alias");
  });
});

describe("path builders", () => {
  beforeEach(() => {
    setPluginAliases([{ id: "5WWSzBORLfZgym533u87I", alias: "youtube" }]);
  });

  it("rewrites a legacy id path to the alias form", () => {
    expect(toContentPath("5WWSzBORLfZgym533u87I", ["albums", "abc"])).toBe(
      "/s/youtube/albums/abc"
    );
  });

  it("accepts an alias in the plugin segment too", () => {
    expect(toContentPath("youtube", ["library"])).toBe("/s/youtube/library");
  });

  it("leaves an uninstalled plugin's segment as it found it", () => {
    expect(toContentPath("spotify", ["library"])).toBe("/s/spotify/library");
  });

  it("builds a content path from a plugin id", () => {
    expect(
      pluginContentPath("5WWSzBORLfZgym533u87I", "artists", "xyz")
    ).toBe("/s/youtube/artists/xyz");
  });
});
