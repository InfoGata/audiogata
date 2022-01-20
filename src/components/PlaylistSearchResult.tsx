import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import React from "react";
import { IPlaylist, ISong } from "../models";
import { getApiByName, getThumbnailImage, searchThumbnailSize } from "../utils";

interface IPlaylistResultProps {
  playlist: IPlaylist;
  clearSearch: () => void;
  setTrackResults: (songs: ISong[]) => void;
}

const PlaylistSearchResult: React.FC<IPlaylistResultProps> = props => {
  const onClickPlaylist = async () => {
    props.clearSearch();
    const api = getApiByName(props.playlist.from || "");
    if (api) {
      const songs = await api.getPlaylistTracks(props.playlist);
      props.setTrackResults(songs);
    }
  };
  const image = getThumbnailImage(props.playlist.images, searchThumbnailSize);
  return (
    <ListItem button={true} onClick={onClickPlaylist}>
      <ListItemAvatar>
        <Avatar
          alt={props.playlist.name}
          src={image}
          style={{ borderRadius: 0 }}
        />
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography
            dangerouslySetInnerHTML={{ __html: props.playlist.name }}
          />
        }
      />
    </ListItem>
  );
};

export default React.memo(PlaylistSearchResult);
