import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  ListItemSecondaryAction,
  IconButton,
} from "@mui/material";
import React from "react";
import { Song } from "../types";
import { addTrack, setTrack } from "../store/reducers/songReducer";
import { getThumbnailImage, searchThumbnailSize } from "../utils";
import { MoreHoriz } from "@mui/icons-material";
import { useAppDispatch } from "../store/hooks";

interface TrackSearchResultProps {
  track: Song;
  openMenu: (event: React.MouseEvent<HTMLButtonElement>, song: Song) => void;
}
const TrackSearchResult: React.FC<TrackSearchResultProps> = (props) => {
  const { track, openMenu } = props;
  const dispatch = useAppDispatch();
  const openSongMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    openMenu(event, track);
  };

  const onClickSong = () => {
    dispatch(addTrack(props.track));
    dispatch(setTrack(props.track));
  };

  const image = getThumbnailImage(track.images, searchThumbnailSize);
  return (
    <ListItem button={true} onClick={onClickSong}>
      <ListItemAvatar>
        <Avatar alt={track.name} src={image} style={{ borderRadius: 0 }} />
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography dangerouslySetInnerHTML={{ __html: track.name }} />
        }
      />
      <ListItemSecondaryAction>
        <IconButton onClick={openSongMenu} size="large">
          <MoreHoriz />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default React.memo(TrackSearchResult);
