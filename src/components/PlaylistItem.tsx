import { ListItem, ListItemText, Typography } from "@material-ui/core";
import React from "react";
import { Draggable } from "react-beautiful-dnd";
import { ISong } from "../services/data/database";

interface IProps {
  index: number;
  song: ISong;
  currentSong?: ISong;
}

const PlaylistItem: React.FC<IProps> = props => {
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
