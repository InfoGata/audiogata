import { List, ListItem, ListItemText } from "@mui/material";
import React from "react";
import { Track } from "../plugintypes";
import { usePlugins } from "../PluginsContext";
import { formatSeconds } from "../utils";
import { useTranslation } from "react-i18next";

interface TrackInfoProps {
  track: Track;
}

const TrackInfo: React.FC<TrackInfoProps> = (props) => {
  const { track } = props;
  const { plugins } = usePlugins();
  const { t } = useTranslation();
  const plugin = plugins.find((p) => p.id === track.pluginId);

  return (
    <>
      <List>
        <ListItem>
          <ListItemText primary={t("trackName")} secondary={track.name} />
        </ListItem>
        <ListItem>
          <ListItemText primary="Id" secondary={track.id} />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={`${t("plugin")} Id`}
            secondary={track.pluginId}
          />
        </ListItem>
        <ListItem>
          <ListItemText primary={t("plugin")} secondary={plugin?.name} />
        </ListItem>
        <ListItem>
          <ListItemText primary="API Id" secondary={track.apiId} />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={t("trackDuration")}
            secondary={formatSeconds(track.duration)}
          />
        </ListItem>
      </List>
    </>
  );
};

export default TrackInfo;
