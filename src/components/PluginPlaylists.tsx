import React from "react";
import { usePlugins } from "../PluginsContext";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { IPlaylist } from "../types";
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  Typography,
} from "@mui/material";
import { getThumbnailImage, playlistThumbnailSize } from "../utils";

const PluginPlaylists: React.FC = () => {
  const { plugins } = usePlugins();
  const { id } = useParams<"id">();
  const [playlists, setPlaylists] = React.useState<IPlaylist[]>([]);
  const plugin = plugins.find((p) => p.id === id);

  React.useEffect(() => {
    const getPlaylists = async () => {
      if (plugin && (await plugin.hasDefined.getUserPlaylists())) {
        const p = await plugin.remote.getUserPlaylists();
        setPlaylists(p);
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
    <Grid container spacing={2}>
      {playlistLinks}
    </Grid>
  ) : (
    <>Not Found</>
  );
};

export default PluginPlaylists;
