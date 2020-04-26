import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
  ListItemSecondaryAction,
  IconButton,
} from "@material-ui/core";
import React from "react";
import { useDispatch } from "react-redux";
import { ISong } from "../models";
import { addTrack } from "../store/reducers/songReducer";
import { AppDispatch } from "../store/store";
import { getThumbnailImage, searchThumbnailSize } from "../utils";
import { MoreHoriz } from "@material-ui/icons";

interface ITrackResultProps {
  track: ISong;
  openMenu: (event: React.MouseEvent<HTMLButtonElement>, song: ISong) => void;
}
const TrackSearchResult: React.FC<ITrackResultProps> = props => {
  const { track, openMenu } = props;
  const dispatch = useDispatch<AppDispatch>();
  const openSongMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    openMenu(event, track);
  }

  const onClickSong = () => {
    dispatch(addTrack(props.track));
  };

  const image = getThumbnailImage(track.images, searchThumbnailSize);
  return (
    <ListItem button={true} onClick={onClickSong}>
      <ListItemAvatar>
        <Avatar
          alt={track.name}
          src={image}
          style={{ borderRadius: 0 }}
        />
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography dangerouslySetInnerHTML={{ __html: track.name }} />
        }
      />
      <ListItemSecondaryAction>
        <IconButton onClick={openSongMenu}>
          <MoreHoriz />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default React.memo(TrackSearchResult);
