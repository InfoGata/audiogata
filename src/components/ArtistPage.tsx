import { Backdrop, CircularProgress, List, Typography } from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router";
import { usePlugins } from "../PluginsContext";
import { Artist } from "../plugintypes";
import AlbumSearchResult from "./AlbumSearchResult";

const ArtistPage: React.FC = () => {
  const { pluginid } = useParams<"pluginid">();
  const { id } = useParams<"id">();
  const { plugins, pluginsLoaded } = usePlugins();
  const [artistInfo, setArtistInfo] = React.useState<Artist>();

  const onGetArtist = async () => {
    const plugin = plugins.find((p) => p.id === pluginid);
    if (plugin && (await plugin.hasDefined.onGetArtistAlbums())) {
      const artistData = await plugin.remote.onGetArtistAlbums({ apiId: id });
      setArtistInfo(artistData.artist);
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
      <Typography variant="h3">{artistInfo?.name}</Typography>
      <List>{albumsList}</List>
    </>
  );
};

export default ArtistPage;
