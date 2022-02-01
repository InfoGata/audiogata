import { MoreHoriz, PlayArrow } from "@mui/icons-material";
import { IconButton, TableCell } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { IPlaylist, ISong } from "../models";
import { setTrack, setTracks } from "../store/reducers/songReducer";
import { AppDispatch, AppState } from "../store/store";
import { formatSeconds } from "../utils";

interface IProps {
  song: ISong;
  playlist: IPlaylist;
}

const PlaylistItem: React.FC<IProps> = (props) => {
  const { song, playlist } = props;
  const currentSong = useSelector((state: AppState) => state.song.currentSong);
  const dispatch = useDispatch<AppDispatch>();
  const playSong = () => {
    dispatch(setTrack(song));
    dispatch(setTracks(playlist.songs));
  };

  return (
    <>
      <TableCell>
        <IconButton aria-label="play" size="small" onClick={playSong}>
          <PlayArrow />
        </IconButton>
      </TableCell>
      <TableCell>{song.name}</TableCell>
      <TableCell>{formatSeconds(song.duration)}</TableCell>
      <TableCell>
        <IconButton aria-label="options" size="small">
          <MoreHoriz />
        </IconButton>
      </TableCell>
    </>
  );
};

export default PlaylistItem;
