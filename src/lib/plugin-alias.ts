import { PluginInfo } from "@/plugintypes";

/**
 * Plugin ids are stable and shareable but unreadable (`/s/5WWSzBORLfZgym533u87I/library`).
 * An alias is a short readable name assigned locally, so no plugin author can
 * squat a name and two plugins for the same source can coexist (`youtube`,
 * `youtube-2`). Ids remain the identity everywhere in the app — they key
 * favorites, plugin auth, the native filesystem layout and the
 * `{id}.audiogata.com` iframe origin — the alias only ever exists in the url.
 */

export const MIN_ALIAS_LENGTH = 2;
export const MAX_ALIAS_LENGTH = 32;

export const normalizeAlias = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, MAX_ALIAS_LENGTH)
    .replace(/-$/, "");

/**
 * Plugins are conventionally named "Plugin for Youtube", and carrying all of
 * that into the url defeats the point. The boilerplate sits at either end
 * depending on who wrote the manifest — "Plugin for Youtube" here, "Youtube
 * Plugin for AudioGata" elsewhere — so cut both and keep what names the source.
 */
export const aliasFromName = (name: string): string => {
  const withoutPrefix = name.replace(/^\s*plugins?\s+(for\s+)?/i, "");
  const trimmed = normalizeAlias(withoutPrefix.replace(/\bplugins?\b.*$/i, ""));
  return trimmed.length >= MIN_ALIAS_LENGTH ? trimmed : normalizeAlias(name);
};

export type AliasError = "invalid" | "tooShort" | "isPluginId" | "taken";

type AliasHolder = Pick<PluginInfo, "id" | "alias">;

/**
 * Validates an alias the user typed. `selfId` is excluded from the taken check
 * so re-saving a plugin's own alias isn't a conflict with itself.
 */
export const validateAlias = (
  alias: string,
  plugins: AliasHolder[],
  selfId?: string
): AliasError | null => {
  if (alias !== normalizeAlias(alias)) return "invalid";
  if (alias.length < MIN_ALIAS_LENGTH) return "tooShort";
  // An alias that matches some plugin's id would make that plugin's own id url
  // resolve to the wrong plugin.
  if (plugins.some((p) => p.id === alias && p.id !== selfId))
    return "isPluginId";
  if (plugins.some((p) => p.alias === alias && p.id !== selfId)) return "taken";
  return null;
};

/**
 * Picks the alias a plugin actually gets: the requested one, or the first free
 * `-N` variant. Never fails, so installing a plugin can't be blocked by a name
 * another plugin already claimed.
 */
export const assignAlias = (
  requested: string,
  plugins: AliasHolder[],
  selfId?: string
): string | undefined => {
  const base = normalizeAlias(requested);
  if (base.length < MIN_ALIAS_LENGTH) return undefined;

  if (!validateAlias(base, plugins, selfId)) return base;

  for (let suffix = 2; suffix < 1000; suffix++) {
    const candidate = `${base.slice(
      0,
      MAX_ALIAS_LENGTH - `-${suffix}`.length
    )}-${suffix}`;
    if (!validateAlias(candidate, plugins, selfId)) return candidate;
  }
  return undefined;
};

// Module level rather than React state: TanStack's params.parse/stringify are
// plain functions called by the router with no access to context. The registry
// is seeded from IndexedDB before the router mounts and refreshed whenever
// plugin frames are published (see contexts/PluginsContext and router.tsx).
let aliasToId = new Map<string, string>();
let idToAlias = new Map<string, string>();

export const setPluginAliases = (plugins: AliasHolder[]) => {
  aliasToId = new Map();
  idToAlias = new Map();
  for (const plugin of plugins) {
    if (!plugin.id || !plugin.alias) continue;
    aliasToId.set(plugin.alias, plugin.id);
    idToAlias.set(plugin.id, plugin.alias);
  }
};

const stripSuffix = (alias: string) => alias.replace(/-\d+$/, "");

const suffixOf = (alias: string) => Number(alias.match(/-(\d+)$/)?.[1] ?? 0);

/**
 * Url segment -> plugin id. Falls through to the input unchanged when nothing
 * matches, so plugin id urls keep working and an unknown alias reaches the
 * route's not-installed handling rather than silently resolving to something
 * else.
 */
export const resolvePluginParam = (param: string): string => {
  const exact = aliasToId.get(param);
  if (exact) return exact;

  // A shared url may carry an alias that deduped differently here: someone with
  // one youtube plugin shares `/s/youtube/...`, but this device has it as
  // `youtube-2`. Match on the base name, lowest suffix first.
  const base = stripSuffix(param);
  const candidates = [...aliasToId.keys()]
    .filter((alias) => stripSuffix(alias) === base)
    .sort((a, b) => suffixOf(a) - suffixOf(b));
  const fallback = candidates[0];
  if (fallback) return aliasToId.get(fallback)!;

  return param;
};

/** Plugin id -> url segment. Unchanged when the plugin has no alias. */
export const aliasForId = (id: string): string => idToAlias.get(id) ?? id;
