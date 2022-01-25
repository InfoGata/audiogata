import { ListItem, ListItemText, Typography } from "@mui/material";
import React from "react";
import { useDispatch } from "react-redux";
import { IPlaylist, ISong } from "../models";
import { setTrack, setTracks } from "../store/reducers/songReducer";
import { AppDispatch } from "../store/store";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface IProps {
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
  const {
    isDragging,
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: song.id || "" });

  return (
    <ListItem
      button={true}
      key={song.id}
      selected={currentSong && currentSong.id === song.id}
      onClick={playSong}
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      sx={{
        position: "relative",
        zIndex: isDragging ? 1 : undefined,
        transform: CSS.Translate.toString(transform),
        transition,
        touchAction: "none",
      }}
    >
      <ListItemText
        primary={<Typography dangerouslySetInnerHTML={{ __html: song.name }} />}
      />
    </ListItem>
  );
};

export default PlaylistItem;
