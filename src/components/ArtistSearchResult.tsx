import { MoreHoriz } from "@mui/icons-material";
import {
  Avatar,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
} from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import useItemMenu from "../hooks/useItemMenu";
import { Artist } from "../plugintypes";
import { getThumbnailImage, searchThumbnailSize } from "../utils";

interface ArtistSearchResultProps {
  artist: Artist;
  pluginId: string;
}

const ArtistSearchResult: React.FC<ArtistSearchResultProps> = (props) => {
  const { artist, pluginId } = props;
  const { openMenu } = useItemMenu();

  const openArtistMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (openMenu) {
      openMenu(event, { type: "artist", item: artist });
    }
  };

  const image = getThumbnailImage(artist.images, searchThumbnailSize);
  return (
    <ListItem disablePadding>
      <ListItemButton
        component={Link}
        to={`/plugins/${pluginId}/artists/${artist.apiId}`}
        state={artist}
      >
        <ListItemAvatar>
          <Avatar alt={artist.name} src={image} style={{ borderRadius: 0 }} />
        </ListItemAvatar>
        <ListItemText>{artist.name}</ListItemText>
      </ListItemButton>
      <ListItemSecondaryAction>
        <IconButton onClick={openArtistMenu} size="large">
          <MoreHoriz />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default React.memo(ArtistSearchResult);
