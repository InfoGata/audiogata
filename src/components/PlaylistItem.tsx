import { ListItem, ListItemText, Typography } from "@mui/material";
import React from "react";
import { Draggable } from "react-beautiful-dnd";
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

const PlaylistItem: React.FC<IProps> = props => {
  const { song, index, currentSong, playlist } = props;
  const dispatch = useDispatch<AppDispatch>();
  const playSong = () => {
    dispatch(setTrack(song));
    dispatch(setTracks(playlist.songs));
  };
  return (
    <Draggable key={song.id} draggableId={song.id || ""} index={index}>
      {provided => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <ListItem
            button={true}
            key={song.id}
            selected={currentSong && currentSong.id === song.id}
            onClick={playSong}
          >
            <ListItemText
              primary={
                <Typography dangerouslySetInnerHTML={{ __html: song.name }} />
              }
            />
          </ListItem>
        </div>
      )}
    </Draggable>
  );
};

export default PlaylistItem;
