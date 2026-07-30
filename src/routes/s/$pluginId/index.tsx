import { canonicalizePluginUrl, pluginIdParams } from "@/lib/plugin-route";
import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * `/s/youtube` is the natural thing to type or share. AudioGata has no single
 * landing page for a plugin's content — what it offers varies by plugin — so
 * send it to the details page, which lists what the plugin can do.
 */
export const Route = createFileRoute("/s/$pluginId/")({
  params: pluginIdParams(),
  beforeLoad: (ctx) => {
    canonicalizePluginUrl(ctx);

    throw redirect({
      to: "/plugins/$pluginId",
      params: { pluginId: ctx.params.pluginId },
      replace: true,
    });
  },
});
