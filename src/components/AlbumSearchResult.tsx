import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@material-ui/core";
import React from "react";
import { IAlbum, ISong } from "../models";
import { getApiByName, getThumbnailImage, searchThumbnailSize } from "../utils";

interface IAlbumResultProps {
  album: IAlbum;
  clearSearch: () => void;
  setTrackResults: (songs: ISong[]) => void;
}

const AlbumSearchResult: React.FC<IAlbumResultProps> = props => {
  const onClickAlbum = async () => {
    props.clearSearch();
    const api = getApiByName(props.album.from);
    if (api) {
      const songs = await api.getAlbumTracks(props.album);
      props.setTrackResults(songs);
    }
  };

  const image = getThumbnailImage(props.album.images, searchThumbnailSize);

  return (
    <ListItem button={true} onClick={onClickAlbum}>
      <ListItemAvatar>
        <Avatar
          alt={props.album.name}
          src={image}
          style={{ borderRadius: 0 }}
        />
      </ListItemAvatar>
      <ListItemText>
        {props.album.name} - {props.album.artistName}
      </ListItemText>
    </ListItem>
  );
};

export default React.memo(AlbumSearchResult);
