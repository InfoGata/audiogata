import { Backdrop, CircularProgress, List, Typography } from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router";
import { useLocation } from "react-router-dom";
import { usePlugins } from "../PluginsContext";
import { Artist } from "../plugintypes";
import AlbumSearchResult from "./AlbumSearchResult";
import PlaylistInfoCard from "./PlaylistInfoCard";

const ArtistPage: React.FC = () => {
  const { pluginid } = useParams<"pluginid">();
  const { id } = useParams<"id">();
  const { plugins, pluginsLoaded } = usePlugins();
  const state = useLocation().state as Artist | null;
  const [artistInfo, setArtistInfo] = React.useState<Artist | null>(state);

  const onGetArtist = async () => {
    const plugin = plugins.find((p) => p.id === pluginid);
    if (plugin && (await plugin.hasDefined.onGetArtistAlbums())) {
      const artistData = await plugin.remote.onGetArtistAlbums({ apiId: id });
      if (artistData.artist) {
        setArtistInfo(artistData.artist);
      }
      return artistData.items;
    }
    return [];
  };

  const query = useQuery(["artistpage", pluginid, id], onGetArtist, {
    enabled: pluginsLoaded,
  });

  const albumsList = query.data?.map((a) => (
    <AlbumSearchResult key={a.apiId} album={a} pluginId={pluginid || ""} />
  ));
  return (
    <>
      <Backdrop open={query.isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      {artistInfo && (
        <PlaylistInfoCard
          name={artistInfo.name || ""}
          images={artistInfo.images}
        />
      )}
      <List>{albumsList}</List>
    </>
  );
};

export default ArtistPage;
