import AlbumCard from "@/components/AlbumCard";
import CardContainer from "@/components/CardContainer";
import ItemMenu from "@/components/ItemMenu";
import React from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router";
import { useLocation } from "react-router-dom";
import ConfirmPluginDialog from "../components/ConfirmPluginDialog";
import Pager from "../components/Pager";
import PlaylistInfoCard from "../components/PlaylistInfoCard";
import Spinner from "../components/Spinner";
import useFindPlugin from "../hooks/useFindPlugin";
import usePagination from "../hooks/usePagination";
import usePlugins from "../hooks/usePlugins";
import { Artist, PageInfo } from "../plugintypes";

const ArtistPage: React.FC = () => {
  const { pluginId } = useParams<"pluginId">();
  const { apiId } = useParams<"apiId">();
  const { plugins, pluginsLoaded } = usePlugins();
  const state = useLocation().state as Artist | null;
  const [artistInfo, setArtistInfo] = React.useState<Artist | null>(state);
  const plugin = plugins.find((p) => p.id === pluginId);
  const { isLoading, pendingPlugin, removePendingPlugin } = useFindPlugin({
    pluginsLoaded,
    pluginId,
    plugin,
  });

  const [currentPage, setCurrentPage] = React.useState<PageInfo>();
  const { page, hasNextPage, hasPreviousPage, onPreviousPage, onNextPage } =
    usePagination(currentPage);
  const onGetArtist = async () => {
    if (plugin && (await plugin.hasDefined.onGetArtistAlbums())) {
      const artistData = await plugin.remote.onGetArtistAlbums({
        apiId: apiId,
        pageInfo: page,
      });
      if (artistData.artist) {
        setArtistInfo(artistData.artist);
      }
      setCurrentPage(artistData.pageInfo);
      return artistData.items;
    }
    return [];
  };

  const query = useQuery(["artistpage", pluginId, apiId, page], onGetArtist, {
    enabled: pluginsLoaded && !!plugin,
  });

  return (
    <>
      <Spinner open={query.isLoading || isLoading} />
      {artistInfo && (
        <PlaylistInfoCard
          name={artistInfo.name || ""}
          images={artistInfo.images}
        />
      )}
      {artistInfo && (
        <ItemMenu itemType={{ type: "artist", item: artistInfo }} />
      )}
      <CardContainer>
        {query.data?.map((a) => (
          <AlbumCard album={a} />
        ))}
      </CardContainer>
      <Pager
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
      />
      <ConfirmPluginDialog
        open={Boolean(pendingPlugin)}
        plugins={pendingPlugin ? [pendingPlugin] : []}
        handleClose={removePendingPlugin}
      />
    </>
  );
};

export default ArtistPage;
