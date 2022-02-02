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
  const openSongMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    openMenu(event, song);
  };

  return (
    <>
      <TableCell></TableCell>
      <TableCell>
        <Typography
          color={currentSong?.id === song.id ? "primary.main" : undefined}
          noWrap={true}
          dangerouslySetInnerHTML={{ __html: song.name }}
        />
      </TableCell>
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
