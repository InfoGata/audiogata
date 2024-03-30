import ItemMenu from "@/components/ItemMenu";
import {
  Card,
  CardActionArea,
  CardActions,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useLiveQuery } from "dexie-react-hooks";
import DOMPurify from "dompurify";
import React from "react";
import { Link } from "react-router-dom";
import PlaylistImage from "../components/PlaylistImage";
import Spinner from "../components/Spinner";
import { db } from "../database";

const FavoritePlayists: React.FC = () => {
  const playlists = useLiveQuery(() => db.favoritePlaylists.toArray());
  const sanitizer = DOMPurify.sanitize;

  if (!playlists) {
    return <Spinner />;
  }

  const playlistCards = playlists?.map((p) => {
    return (
      <Grid item xs={2} key={p.apiId}>
        <Card>
          <CardActionArea
            component={Link}
            to={`/plugins/${p.pluginId}/playlists/${p.apiId}`}
          >
            <PlaylistImage images={p.images} />
          </CardActionArea>
          <CardActions>
            <Stack direction="row" alignItems="center" gap={1}>
              <ItemMenu itemType={{ type: "playlist", item: p }} />
              <Typography
                title={p.name}
                gutterBottom
                variant="body2"
                component="span"
                width={230}
                noWrap
                dangerouslySetInnerHTML={{
                  __html: sanitizer(p.name || ""),
                }}
              />
            </Stack>
          </CardActions>
        </Card>
      </Grid>
    );
  });

  return (
    <Grid container spacing={2}>
      {playlistCards}
    </Grid>
  );
};

export default FavoritePlayists;
