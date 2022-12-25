import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import React from "react";
import { Artist } from "../plugintypes";
import { getThumbnailImage, searchThumbnailSize } from "../utils";
import { Link } from "react-router-dom";

interface ArtistSearchResultProps {
  artist: Artist;
  pluginId: string;
}

const ArtistSearchResult: React.FC<ArtistSearchResultProps> = (props) => {
  const { artist, pluginId } = props;

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
    </ListItem>
  );
};

export default React.memo(ArtistSearchResult);
