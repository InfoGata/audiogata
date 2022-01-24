import { ListItem, ListItemText, Typography } from "@mui/material";
import React from "react";
import { useDispatch } from "react-redux";
import { IPlaylist, ISong } from "../models";
import { setTrack, setTracks } from "../store/reducers/songReducer";
import { AppDispatch } from "../store/store";

interface IProps {
  index: number;
  song: ISong;
  currentSong?: ISong;
  playlist: IPlaylist;
}

const PlaylistItem: React.FC<IProps> = (props) => {
  const { song, currentSong, playlist } = props;
  const dispatch = useDispatch<AppDispatch>();
  const playSong = () => {
    dispatch(setTrack(song));
    dispatch(setTracks(playlist.songs));
  };
  return (
    <ListItem
      button={true}
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
