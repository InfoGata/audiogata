import {
  IconButton,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from "@mui/material";
import { MoreHoriz } from "@mui/icons-material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ISong } from "../models";
import { setTrack } from "../store/reducers/songReducer";
import { AppDispatch, AppState } from "../store/store";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface IProps {
  song: ISong;
  openMenu: (event: React.MouseEvent<HTMLButtonElement>, song: ISong) => void;
}

const QueueItem: React.FC<IProps> = (props) => {
  const { song, openMenu } = props;
  const currentSong = useSelector((state: AppState) => state.song.currentSong);
  const dispatch = useDispatch<AppDispatch>();
  const playListClick = () => dispatch(setTrack(song));
  const openSongMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    openMenu(event, song);
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
      key={song.id}
      selected={currentSong && currentSong.id === song.id}
      onClick={playListClick}
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
        disableTypography={true}
        primary={
          <Typography
            noWrap={true}
            dangerouslySetInnerHTML={{ __html: song.name }}
          />
        }
      />
      {isDragging ? null : (
        <ListItemSecondaryAction>
          <IconButton onClick={openSongMenu} size="large">
            <MoreHoriz />
          </IconButton>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
};

export default QueueItem;
