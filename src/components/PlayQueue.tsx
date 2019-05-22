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

class PlayQueue extends React.PureComponent<IProps, {}> {
  public render() {
    return (
      <List>
        {this.props.songList.map((songInfo, index) => (
          <ListItem
            button={true}
            key={songInfo.id}
            selected={
              this.props.currentSong &&
              this.props.currentSong.id === songInfo.id
            }
            onClick={this.props.onPlaylistClick.bind(this, index)}
          >
            <ListItemText
              primary={
                <Typography
                  dangerouslySetInnerHTML={{ __html: songInfo.name }}
                />
              }
            />
            <ListItemSecondaryAction>
              <IconButton
                aria-label="Delete"
                onClick={this.props.onDeleteClick.bind(this, songInfo)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    );
  }
}

export default PlayQueue;
