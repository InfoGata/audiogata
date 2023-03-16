import { MoreHoriz } from "@mui/icons-material";
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
import useItemMenu from "../hooks/useItemMenu";
import thumbnail from "../thumbnail.png";
import { getThumbnailImage, playlistThumbnailSize } from "../utils";

const FavoriteAlbums: React.FC = () => {
  const albums = useLiveQuery(() => db.favoriteAlbums.toArray());

  const onImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = thumbnail;
  };

  const { openMenu } = useItemMenu();

  const albumCards = albums?.map((a) => {
    const openAlbumMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (openMenu) {
        openMenu(event, { type: "album", item: a });
      }
    };

    return (
      <Grid item xs={2} key={a.apiId}>
        <Card>
          <CardActionArea
            component={Link}
            to={`/plugins/${a.pluginId}/albums/${a.apiId}`}
          >
            <CardMedia
              component={"img"}
              image={getThumbnailImage(a.images, playlistThumbnailSize)}
              alt={a.name}
              onError={onImageError}
            />
          </CardActionArea>
          <CardActions>
            <Stack direction="row" alignItems="center" gap={1}>
              <IconButton size="small" onClick={openAlbumMenu}>
                <MoreHoriz />
              </IconButton>
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
