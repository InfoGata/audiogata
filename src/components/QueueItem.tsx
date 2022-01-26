import {
  IconButton,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from "@mui/material";
import { MoreHoriz } from "@mui/icons-material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ISong } from "../models";
import { setTrack } from "../store/reducers/songReducer";
import { AppDispatch, AppState } from "../store/store";

interface IProps {
  song: ISong;
  openMenu: (event: React.MouseEvent<HTMLButtonElement>, song: ISong) => void;
}

const QueueItem: React.FC<IProps> = (props) => {
  const { song, openMenu } = props;
  const currentSong = useSelector((state: AppState) => state.song.currentSong);
  const dispatch = useDispatch<AppDispatch>();
  const playListClick = () => dispatch(setTrack(song));
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const openSongMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    openMenu(event, song);
  };

  return (
    <ListItem
      button={true}
      component="div"
      key={song.id}
      selected={currentSong && currentSong.id === song.id}
      onClick={playListClick}
    >
      <ListItemText
        disableTypography={true}
        primary={
          <Typography
            noWrap={true}
            dangerouslySetInnerHTML={{ __html: song.name }}
          />
        }
      />
      <ListItemSecondaryAction>
        <IconButton ref={buttonRef} onClick={openSongMenu} size="large">
          <MoreHoriz />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default QueueItem;
