import { IconButton, TableCell, Typography } from "@mui/material";
import { MoreHoriz } from "@mui/icons-material";
import React from "react";
import { useSelector } from "react-redux";
import { ISong } from "../models";
import { AppState } from "../store/store";
import { formatSeconds } from "../utils";

export interface QueueItemProps {
  song: ISong;
  showTrackLength: boolean;
  openMenu: (event: React.MouseEvent<HTMLButtonElement>, song: ISong) => void;
}

const QueueItem: React.FC<QueueItemProps> = (props) => {
  const { song, openMenu, showTrackLength } = props;
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
      {showTrackLength && <TableCell>{formatSeconds(song.duration)}</TableCell>}
      <TableCell>
        <IconButton aria-label="options" size="small" onClick={openSongMenu}>
          <MoreHoriz />
        </IconButton>
      </TableCell>
    </>
  );
};

export default QueueItem;
