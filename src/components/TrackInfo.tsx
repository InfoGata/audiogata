import { Typography } from "@mui/material";
import React from "react";
import { Track } from "../plugintypes";
import { usePlugins } from "../PluginsContext";

interface TrackInfoProps {
  track: Track;
}

const TrackInfo: React.FC<TrackInfoProps> = (props) => {
  const { track } = props;
  const { plugins } = usePlugins();
  const plugin = plugins.find((p) => p.id === track.pluginId);
  return (
    <>
      <Typography>{track.name}</Typography>
      <Typography>{plugin?.name}</Typography>
    </>
  );
};

export default TrackInfo;
