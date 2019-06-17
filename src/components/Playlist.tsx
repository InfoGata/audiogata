import React from "react";
import { List, ListItem, ListItemText, Typography } from "@material-ui/core";
import { ISong } from "../services/data/database";

interface IProps {
  id: string;
}

interface IState {
  name: string;
  tracks: ISong[];
}

class Playlist extends React.PureComponent<IProps, IState> {
  public render() {
    const { name, tracks } = this.state;
    return (
      <div>
        <h1>{name}</h1>
        <List>
          {tracks.map((songInfo, index) => {
            return (
              <ListItem button={true} key={songInfo.id}>
                <ListItemText
                  primary={
                    <Typography
                      dangerouslySetInnerHTML={{
                        __html: songInfo.name,
                      }}
                    />
                  }
                />
              </ListItem>
            );
          })}
        </List>
      </div>
    );
  }

  private playPlaylistClick() {}
}

export default Playlist;
