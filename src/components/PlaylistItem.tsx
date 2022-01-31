import { ListItem, ListItemText, Typography } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { IPlaylist, ISong } from "../models";
import { setTrack, setTracks } from "../store/reducers/songReducer";
import { AppDispatch, AppState } from "../store/store";

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
    <ListItem
      component="div"
      key={song.id}
      selected={currentSong && currentSong.id === song.id}
      onClick={playSong}
    >
      <ListItemText
        primary={<Typography dangerouslySetInnerHTML={{ __html: song.name }} />}
      />
    </ListItem>
  );
};

export default PlaylistItem;
