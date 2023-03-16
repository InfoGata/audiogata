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

const FavoriteArtists: React.FC = () => {
  const artists = useLiveQuery(() => db.favoriteArtists.toArray());

  const onImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = thumbnail;
  };

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
            <CardMedia
              component={"img"}
              image={getThumbnailImage(a.images, playlistThumbnailSize)}
              alt={a.name}
              onError={onImageError}
            />
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
      {artistCards}
    </Grid>
  );
};

export default FavoriteArtists;
