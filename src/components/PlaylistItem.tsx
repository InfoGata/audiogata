import {
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import PlaylistAddIcon from "@material-ui/icons/PlaylistAdd";
import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import { IPlaylist, ISong } from "../services/data/database";
import { addSongs } from "../store/actions/playlist";
import { AppState } from "../store/store";
import AddPlaylistDialog from "./AddPlaylistDialog";

interface IProps {
  index: number;
  song: ISong;
  currentSong?: ISong;
}

const PlaylistItem = (props: IProps) => {
  return (
    <Draggable
      key={props.song.id}
      draggableId={props.song.id || ""}
      index={props.index}
    >
      {provided => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <ListItem
            button={true}
            key={props.song.id}
            selected={
              props.currentSong && props.currentSong.id === props.song.id
            }
          >
            <ListItemText
              primary={
                <Typography
                  dangerouslySetInnerHTML={{ __html: props.song.name }}
                />
              }
            />
          </ListItem>
        </div>
      )}
    </Draggable>
  );
};

export default PlaylistItem;
