import { List, ListItem, ListItemText } from "@mui/material";
import React from "react";
import { Track } from "../plugintypes";
import { usePlugins } from "../PluginsContext";
import { formatSeconds } from "../utils";

interface TrackInfoProps {
  track: Track;
}

const TrackInfo: React.FC<TrackInfoProps> = (props) => {
  const { track } = props;
  const { plugins } = usePlugins();
  const plugin = plugins.find((p) => p.id === track.pluginId);
  return (
    <>
      <List>
        <ListItem>
          <ListItemText primary="Track name" secondary={track.name} />
        </ListItem>
        <ListItem>
          <ListItemText primary="ID" secondary={track.id} />
        </ListItem>
        <ListItem>
          <ListItemText primary="Plugin Id" secondary={track.pluginId} />
        </ListItem>
        <ListItem>
          <ListItemText primary="Plugin" secondary={plugin?.name} />
        </ListItem>
        <ListItem>
          <ListItemText primary="API ID" secondary={track.apiId} />
        </ListItem>
        <ListItem>
          <ListItemText
            primary="Duration"
            secondary={formatSeconds(track.duration)}
          />
        </ListItem>
      </List>
    </>
  );
};

export default TrackInfo;
