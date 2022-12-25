import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { Album } from "../plugintypes";
import { getThumbnailImage, searchThumbnailSize } from "../utils";

interface AlbumSearchResultProps {
  album: Album;
  pluginId: string;
}

const AlbumSearchResult: React.FC<AlbumSearchResultProps> = (props) => {
  const { album, pluginId } = props;

  const image = getThumbnailImage(album.images, searchThumbnailSize);

  return (
    <ListItem disablePadding>
      <ListItemButton
        component={Link}
        to={`/plugins/${pluginId}/albums/${album.apiId}`}
        state={album}
      >
        <ListItemAvatar>
          <Avatar alt={album.name} src={image} style={{ borderRadius: 0 }} />
        </ListItemAvatar>
        <ListItemText primary={album.name} secondary={album.artistName} />
      </ListItemButton>
    </ListItem>
  );
};

export default React.memo(AlbumSearchResult);
