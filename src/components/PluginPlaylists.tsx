import React from "react";
import { usePlugins } from "../PluginsContext";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { PlaylistInfo } from "../plugintypes";
import {
  Backdrop,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  CircularProgress,
  Grid,
  Typography,
} from "@mui/material";
import { getThumbnailImage, playlistThumbnailSize } from "../utils";

const PluginPlaylists: React.FC = () => {
  const { plugins } = usePlugins();
  const { id } = useParams<"id">();
  const [playlists, setPlaylists] = React.useState<PlaylistInfo[]>([]);
  const [backdropOpen, setBackdropOpen] = React.useState(false);
  const plugin = plugins.find((p) => p.id === id);

  React.useEffect(() => {
    const getPlaylists = async () => {
      if (plugin && (await plugin.hasDefined.onGetUserPlaylists())) {
        setBackdropOpen(true);
        const request = {};
        const p = await plugin.remote.onGetUserPlaylists(request);
        setPlaylists(p.items);
        setBackdropOpen(false);
      }
    };
    getPlaylists();
  }, [plugin]);

  const playlistLinks = playlists.map((p, i) => (
    <Grid item xs={2} key={i}>
      <Card>
        <CardActionArea
          component={Link}
          to={`/plugins/${id}/playlists/${p.apiId}`}
        >
          <CardMedia
            component={"img"}
            image={getThumbnailImage(p.images, playlistThumbnailSize)}
            alt={p.name}
          />
          <CardContent>
            <Typography gutterBottom variant="h6" component="div">
              {p.name}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grid>
  ));
  return plugin ? (
    <>
      <Backdrop open={backdropOpen}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Grid container spacing={2}>
        {playlistLinks}
      </Grid>
    </>
  ) : (
    <>Not Found</>
  );
};

export default PluginPlaylists;
