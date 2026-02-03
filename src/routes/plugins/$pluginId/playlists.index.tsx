import { createFileRoute } from "@tanstack/react-router";
import PlaylistListItem from "@/components/PlaylistListItem";
import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import Pager from "@/components/Pager";
import Spinner from "@/components/Spinner";
import usePagination from "@/hooks/usePagination";
import usePlugins from "@/hooks/usePlugins";
import { PageInfo, UserPlaylistRequest } from "@/plugintypes";
import Title from "@/components/Title";

const PluginPlaylists: React.FC = () => {
  const { plugins, pluginsLoaded } = usePlugins();
  const { pluginId } = Route.useParams();
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = React.useState<PageInfo>();
  const plugin = plugins.find((p) => p.id === pluginId);

  const { page, hasNextPage, hasPreviousPage, onPreviousPage, onNextPage } =
    usePagination(currentPage);

  const getPlaylists = async () => {
    if (plugin && (await plugin.hasDefined.onGetUserPlaylists())) {
      const request: UserPlaylistRequest = {
        pageInfo: page,
      };
      const p = await plugin.remote.onGetUserPlaylists(request);
      setCurrentPage(p.pageInfo);
      return p.items;
    }
    return [];
  };

  const query = useQuery({
    queryKey: ["pluginplaylists", pluginId, page],
    queryFn: getPlaylists,
    enabled: pluginsLoaded && !!plugin,
  });
  const playlists = query.data || [];

  const playlistList = playlists.map((p) => (
    <PlaylistListItem key={p.id} playlist={p} isUserPlaylist={true} />
  ));
  return plugin ? (
    <>
      <Spinner open={query.isLoading} />
      <Title title={t("playlists")} />
      <div>{playlistList}</div>
      <Pager
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
      />
    </>
  ) : (
    <>{t("notFound")}</>
  );
};

export const Route = createFileRoute("/plugins/$pluginId/playlists/")({
  component: PluginPlaylists,
});
