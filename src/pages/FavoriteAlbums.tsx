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
import React from "react";
import { Link } from "react-router-dom";
import PlaylistImage from "../components/PlaylistImage";
import Spinner from "../components/Spinner";
import { db } from "../database";

const FavoriteAlbums: React.FC = () => {
  const albums = useLiveQuery(() => db.favoriteAlbums.toArray());

  if (!albums) {
    return <Spinner />;
  }

  const albumCards = albums?.map((a) => {
    return (
      <Grid item xs={2} key={a.apiId}>
        <Card>
          <CardActionArea
            component={Link}
            to={`/plugins/${a.pluginId}/albums/${a.apiId}`}
          >
            <PlaylistImage images={a.images} />
          </CardActionArea>
          <CardActions>
            <Stack direction="row" alignItems="center" gap={1}>
              <ItemMenu itemType={{ type: "album", item: a }} />
              <Typography
                title={a.name}
                gutterBottom
                variant="body2"
                component="span"
                width={230}
                noWrap
              >
                {a.name}
              </Typography>
            </Stack>
          </CardActions>
        </Card>
      </Grid>
    );
  });

  return (
    <Grid container spacing={2}>
      {albumCards}
    </Grid>
  );
};

export default FavoriteAlbums;
