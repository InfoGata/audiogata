import { TableCell, Typography } from "@mui/material";
import React from "react";
import { IPlaylist, ISong } from "../types";
import { useAppSelector } from "../store/hooks";
import { formatSeconds } from "../utils";

interface IProps {
  song: ISong;
  playlist?: IPlaylist;
  showTrackLength: boolean;
}

const PlaylistItem: React.FC<IProps> = (props) => {
  const { song, showTrackLength } = props;
  const currentSong = useAppSelector((state) => state.song.currentSong);

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
        {/*<IconButton aria-label="options" size="small">
          <MoreHoriz />
  </IconButton>*/}
      </TableCell>
    </>
  );
};

export default PlaylistItem;
