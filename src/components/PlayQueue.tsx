import { List } from "@material-ui/core";
import React from "react";
import { ISong } from "../services/data/database";
import QueueItem from "./QueueItem";

interface IProps {
  songList: ISong[];
  currentSong?: ISong;
  onDeleteClick: (song: ISong) => void;
  onPlaylistClick: (playlistIndex: number) => void;
}

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
