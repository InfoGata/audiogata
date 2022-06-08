import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Fade,
  Grid,
  Typography,
} from "@mui/material";
import React from "react";
import { usePlugins } from "../PluginsContext";
import { Album, Artist, PlaylistInfo, Track } from "../plugintypes";
import { getThumbnailImage, playlistThumbnailSize } from "../utils";
import SelectPlugin from "./SelectPlugin";

const TopItemCards: React.FC = () => {
  const [topTracks, setTopTracks] = React.useState<Track[]>();
  const [topAlbums, setTopAlbums] = React.useState<Album[]>();
  const [topArtists, setTopArtists] = React.useState<Artist[]>();
  const [topPlaylists, setTopPlaylists] = React.useState<PlaylistInfo[]>();
  const [pluginId, setPluginId] = React.useState("");
  const { plugins } = usePlugins();
  React.useEffect(() => {
    const getTopItems = async () => {
      const plugin = plugins.find((p) => p.id === pluginId);
      if (plugin) {
        const topItems = await plugin.remote.onGetTopItems();
        setTopTracks(topItems.tracks?.items);
        setTopAlbums(topItems.albums?.items);
        setTopArtists(topItems.artists?.items);
        setTopPlaylists(topItems.playlists?.items);
      }
    };

    getTopItems();
  }, [pluginId, plugins]);

  const topTrackComponents = topTracks?.map((t) => {
    const image = getThumbnailImage(t.images, playlistThumbnailSize);
    return (
      <Card
        key={t.apiId}
        sx={{
          width: 300,
          height: 236,
          display: "inline-block",
          margin: "10px",
          whiteSpace: "pre-wrap",
        }}
      >
        <CardActionArea>
          <CardMedia component="img" src={image} sx={{ height: 160 }} />
          <CardContent>
            <Typography gutterBottom variant="body2" component="p" noWrap>
              {t.name}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  });

  return (
    <>
      <Grid sx={{ display: pluginId ? "block" : "none" }}>
        <SelectPlugin
          pluginId={pluginId}
          setPluginId={setPluginId}
          methodName="onGetTopItems"
        />
      </Grid>
      <Fade in={!!topTracks}>
        <Grid>
          <Typography variant="h5" style={{ marginLeft: "15px" }}>
            Top Tracks
          </Typography>
          <Grid sx={{ whiteSpace: "nowrap", overflowX: "scroll" }}>
            {topTrackComponents}
          </Grid>
        </Grid>
      </Fade>
    </>
  );
};

export default TopItemCards;
