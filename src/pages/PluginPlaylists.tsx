import PlaylistListItem from "@/components/PlaylistListItem";
import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { useParams } from "react-router";
import Pager from "../components/Pager";
import Spinner from "../components/Spinner";
import usePagination from "../hooks/usePagination";
import usePlugins from "../hooks/usePlugins";
import { PageInfo, UserPlaylistRequest } from "../plugintypes";

const PluginPlaylists: React.FC = () => {
  const { plugins, pluginsLoaded } = usePlugins();
  const { pluginId } = useParams<"pluginId">();
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

  const query = useQuery(["pluginplaylists", pluginId, page], getPlaylists, {
    enabled: pluginsLoaded && !!plugin,
  });
  const playlists = query.data || [];

  const playlistList = playlists.map((p) => (
    <PlaylistListItem key={p.id} playlist={p} isUserPlaylist={true} />
  ));
  return plugin ? (
    <>
      <Spinner open={query.isLoading} />
      <h1 className="text-4xl">
        {t("playlists")}: {plugin.name}
      </h1>
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

export default PluginPlaylists;
