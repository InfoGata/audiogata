import {
  IconButton,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { MoreHoriz, PlayArrow } from "@mui/icons-material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ISong } from "../models";
import { setTrack } from "../store/reducers/songReducer";
import { AppDispatch, AppState } from "../store/store";
import { formatSeconds } from "../utils";

export interface QueueItemProps {
  song: ISong;
  openMenu: (event: React.MouseEvent<HTMLButtonElement>, song: ISong) => void;
}

const QueueItem: React.FC<QueueItemProps> = (props) => {
  const { song, openMenu } = props;
  const currentSong = useSelector((state: AppState) => state.song.currentSong);
  const dispatch = useDispatch<AppDispatch>();
  const playListClick = () => dispatch(setTrack(song));
  const openSongMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    openMenu(event, song);
  };

  return (
    <>
      <TableCell>
        <IconButton aria-label="play" size="small" onClick={playListClick}>
          <PlayArrow />
        </IconButton>
      </TableCell>
      <TableCell>{song.name}</TableCell>
      <TableCell>{formatSeconds(song.duration)}</TableCell>
      <TableCell>
        <IconButton aria-label="options" size="small" onClick={openSongMenu}>
          <MoreHoriz />
        </IconButton>
      </TableCell>
    </>
  );
};

export default QueueItem;
