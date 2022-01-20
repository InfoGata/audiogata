import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import React from "react";
import { IAlbum, IArtist } from "../models";
import { getApiByName, getThumbnailImage, searchThumbnailSize } from "../utils";

interface IArtistResultProps {
  artist: IArtist;
  clearSearch: () => void;
  setAlbumResults: (albums: IAlbum[]) => void;
}

const ArtistSearchResult: React.FC<IArtistResultProps> = props => {
  const onClickArtist = async () => {
    props.clearSearch();
    const api = getApiByName(props.artist.from);
    if (api) {
      const albums = await api.getArtistAlbums(props.artist);
      props.setAlbumResults(albums);
    }
  };

  const image = getThumbnailImage(props.artist.images, searchThumbnailSize);
  return (
    <ListItem button={true} onClick={onClickArtist}>
      <ListItemAvatar>
        <Avatar
          alt={props.artist.name}
          src={image}
          style={{ borderRadius: 0 }}
        />
      </ListItemAvatar>
      <ListItemText>{props.artist.name}</ListItemText>
    </ListItem>
  );
};

export default React.memo(ArtistSearchResult);
