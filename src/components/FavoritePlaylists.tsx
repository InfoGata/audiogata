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

const FavoritePlayists: React.FC = () => {
  const playlists = useLiveQuery(() => db.favoritePlaylists.toArray());
  const sanitizer = DOMPurify.sanitize;

  const { openMenu } = useItemMenu();

  const playlistCards = playlists?.map((p) => {
    const openPlaylistMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (openMenu) {
        openMenu(event, { type: "playlist", item: p });
      }
    };
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
              <IconButton size="small" onClick={openPlaylistMenu}>
                <MoreHoriz />
              </IconButton>
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
