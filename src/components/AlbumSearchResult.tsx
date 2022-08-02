import { Avatar, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
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
    <ListItem
      button={true}
      component={Link}
      to={`/plugins/${pluginId}/albums/${album.apiId}`}
    >
      <ListItemAvatar>
        <Avatar alt={album.name} src={image} style={{ borderRadius: 0 }} />
      </ListItemAvatar>
      <ListItemText>
        {album.name} - {album.artistName}
      </ListItemText>
    </ListItem>
  );
};

export default React.memo(AlbumSearchResult);
