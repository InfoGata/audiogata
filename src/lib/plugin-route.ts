import { aliasForId, resolvePluginParam } from "@/lib/plugin-alias";
import { redirect } from "@tanstack/react-router";

/**
 * Shared route options for every route under `/s/$pluginId` and
 * `/plugins/$pluginId`. They translate between the alias in the url and the
 * plugin id the app uses everywhere else, so route bodies and every `<Link
 * params={{ pluginId }}>` keep dealing in ids only.
 */

/**
 * `TExtra` names the route's other path params so they survive the round trip
 * with their types intact, e.g. `pluginIdParams<{ apiId: string }>()`.
 */
export const pluginIdParams = <
  TExtra extends Record<string, string> = Record<never, string>,
>() => ({
  parse: (raw: TExtra & { pluginId: string }) => ({
    ...raw,
    pluginId: resolvePluginParam(raw.pluginId),
  }),
  stringify: (params: TExtra & { pluginId: string }) => ({
    ...params,
    pluginId: aliasForId(params.pluginId),
  }),
});

type PluginBeforeLoadContext = {
  params: { pluginId: string };
  location: { pathname: string; search: Record<string, unknown> };
};

/**
 * Rewrites a url that named the plugin some other way (its id, or an alias that
 * deduped differently on the device that shared it) to the canonical alias, so
 * whatever the user copies out of the address bar is the readable form.
 *
 * Reads the module-level alias registry rather than router context: unlike
 * SocialGata, AudioGata's router carries no context, and this is the only thing
 * that would need one.
 */
export const canonicalizePluginUrl = ({
  params,
  location,
}: PluginBeforeLoadContext) => {
  const alias = aliasForId(params.pluginId);
  // Unchanged means the plugin has no alias (or isn't installed) — leave the
  // url alone rather than redirecting it to itself.
  if (alias === params.pluginId) return;

  // "/s/youtube/library" and "/plugins/youtube/options" both hold it at index 2.
  const segments = location.pathname.split("/");
  if (segments[2] === alias) return;

  segments[2] = alias;
  throw redirect({
    to: segments.join("/"),
    search: location.search,
    replace: true,
  });
};

/**
 * Builds a canonical `/s/<alias>/...` path from a plugin segment (an id or an
 * alias) and the path below it. Used to forward the old `/plugins/<id>/...`
 * content urls; segment names are unchanged by the move, so only the prefix and
 * the plugin segment need rewriting.
 */
export const toContentPath = (pluginSegment: string, rest: string[]) => {
  const alias = aliasForId(resolvePluginParam(pluginSegment));
  return ["/s", alias, ...rest].join("/");
};

/**
 * Builds a `/s/<alias>/...` path for the call sites that pass a plain string to
 * `Link to=` instead of typed `params`. Those bypass `params.stringify`
 * entirely, so without this they would emit id urls that only become readable
 * after `canonicalizePluginUrl` bounces them.
 */
export const pluginContentPath = (pluginId: string, ...segments: string[]) =>
  ["/s", aliasForId(pluginId), ...segments].join("/");
