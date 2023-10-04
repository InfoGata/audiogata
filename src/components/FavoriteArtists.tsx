import { MoreHoriz } from "@mui/icons-material";
import {
  Card,
  CardActionArea,
  CardActions,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useLiveQuery } from "dexie-react-hooks";
import DOMPurify from "dompurify";
import React from "react";
import { Link } from "react-router-dom";
import { db } from "../database";
import useItemMenu from "../hooks/useItemMenu";
import PlaylistImage from "./PlaylistImage";

const FavoriteArtists: React.FC = () => {
  const artists = useLiveQuery(() => db.favoriteArtists.toArray());
  const sanitizer = DOMPurify.sanitize;

  const { openMenu } = useItemMenu();

  const artistCards = artists?.map((a) => {
    const openArtistMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (openMenu) {
        openMenu(event, { type: "artist", item: a });
      }
    };
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
              <IconButton size="small" onClick={openArtistMenu}>
                <MoreHoriz />
              </IconButton>
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
