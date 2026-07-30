import { toContentPath } from "@/lib/plugin-route";
import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * Content used to live under `/plugins/<id>/...`. Those urls are out in the
 * wild — shared links, bookmarks, extension redirects — so forward them to
 * their `/s/<alias>/...` equivalent. The plugin details and options routes are
 * more specific and still match first.
 */
export const Route = createFileRoute("/plugins/$pluginId/$")({
  beforeLoad: ({ params, location }) => {
    const rest = (params._splat ?? "").split("/").filter(Boolean);
    throw redirect({
      to: toContentPath(params.pluginId, rest),
      search: location.search,
      replace: true,
    });
  },
});
