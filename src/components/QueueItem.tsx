import {
  IconButton,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from "@material-ui/core";
import { MoreHoriz } from "@material-ui/icons";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ISong } from "../models";
import { setTrack } from "../store/reducers/songReducer";
import { AppDispatch, AppState } from "../store/store";

interface IProps {
  song: ISong;
  style: object;
  openMenu: (event: React.MouseEvent<HTMLButtonElement>, song: ISong) => void;
}

const QueueItem: React.FC<IProps> = props => {
  const { song, style, openMenu } = props;
  const currentSong = useSelector((state: AppState) => state.song.currentSong);
  const dispatch = useDispatch<AppDispatch>();
  const playListClick = () => dispatch(setTrack(song));
  const openSongMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    openMenu(event, song);
  }

  return (
    <ListItem
      button={true}
      key={song.id}
      ContainerProps={{ style: style }}
      selected={currentSong && currentSong.id === song.id}
      onClick={playListClick}
      ContainerComponent="div"
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
        <IconButton onClick={openSongMenu}>
          <MoreHoriz />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

export default QueueItem;
