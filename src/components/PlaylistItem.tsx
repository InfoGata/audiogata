import { MoreHoriz } from "@mui/icons-material";
import { IconButton, TableCell, Typography } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import { IPlaylist, ISong } from "../models";
import { AppState } from "../store/store";
import { formatSeconds } from "../utils";

interface IProps {
  song: ISong;
  playlist: IPlaylist;
}

const PlaylistItem: React.FC<IProps> = (props) => {
  const { song } = props;
  const currentSong = useSelector((state: AppState) => state.song.currentSong);

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
        {/*<IconButton aria-label="options" size="small">
          <MoreHoriz />
  </IconButton>*/}
      </TableCell>
    </>
  );
};

export default PlaylistItem;
