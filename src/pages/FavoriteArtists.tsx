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

const FavoriteArtists: React.FC = () => {
  const artists = useLiveQuery(() => db.favoriteArtists.toArray());
  const sanitizer = DOMPurify.sanitize;

  if (!artists) {
    return <Spinner />;
  }

  const artistCards = artists?.map((a) => {
    return (
      <Grid item xs={2} key={a.apiId}>
        <Card>
          <CardActionArea
            component={Link}
            to={`/plugins/${a.pluginId}/artists/${a.apiId}`}
          >
            <PlaylistImage images={a.images} />
          </CardActionArea>
          <CardActions>
            <Stack direction="row" alignItems="center" gap={1}>
              <ItemMenu itemType={{ type: "artist", item: a }} />
              <Typography
                title={a.name}
                gutterBottom
                variant="body2"
                component="span"
                width={230}
                noWrap
                dangerouslySetInnerHTML={{
                  __html: sanitizer(a.name || ""),
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
      {artistCards}
    </Grid>
  );
};

export default FavoriteArtists;
