import {
  Card,
  CardActionArea,
  CardActions,
  CardMedia,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { useLiveQuery } from "dexie-react-hooks";
import React from "react";
import { Link } from "react-router-dom";
import { db } from "../database";
import { getThumbnailImage, playlistThumbnailSize } from "../utils";
import thumbnail from "../thumbnail.png";
import { MoreHoriz } from "@mui/icons-material";
import useItemMenu from "../hooks/useItemMenu";
import DOMPurify from "dompurify";

const FavoritePlayists: React.FC = () => {
  const playlists = useLiveQuery(() => db.favoritePlaylists.toArray());
  const sanitizer = DOMPurify.sanitize;

  const onImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = thumbnail;
  };

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
            <CardMedia
              component={"img"}
              image={getThumbnailImage(p.images, playlistThumbnailSize)}
              alt={p.name}
              onError={onImageError}
            />
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
