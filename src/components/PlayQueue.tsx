import {
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import React from "react";
import { ISong } from "../services/data/database";

interface IProps {
  songList: ISong[];
  currentSong?: ISong;
  onDeleteClick: (song: ISong) => void;
  onPlaylistClick: (playlistIndex: number) => void;
}

interface IQueueProps {
  index: number;
  song: ISong;
  currentSong?: ISong;
  onDeleteClick: (song: ISong) => void;
  onPlaylistClick: (playlistIndex: number) => void;
}

const QueueItem = (props: IQueueProps) => {
  function playListClick() {
    props.onPlaylistClick(props.index);
  }
  function deleteClick() {
    props.onDeleteClick(props.song);
  }
  return (
    <ListItem
      button={true}
      key={props.song.id}
      selected={props.currentSong && props.currentSong.id === props.song.id}
      onClick={playListClick}
    >
      <ListItemText
        primary={
          <Typography dangerouslySetInnerHTML={{ __html: props.song.name }} />
        }
      />
      <ListItemSecondaryAction>
        <IconButton aria-label="Delete" onClick={deleteClick}>
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
};

const PlayQueue = (props: IProps) => {
  return (
    <List>
      {props.songList.map((songInfo, index) => (
        <QueueItem
          key={songInfo.id}
          index={index}
          song={songInfo}
          currentSong={props.currentSong}
          onDeleteClick={props.onDeleteClick}
          onPlaylistClick={props.onPlaylistClick}
        />
      ))}
    </List>
  );
};

export default React.memo(PlayQueue);
