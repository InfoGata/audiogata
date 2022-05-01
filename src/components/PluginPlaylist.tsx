import { List, ListItem, ListItemText, Typography } from "@mui/material";
import React from "react";
import { useParams } from "react-router";
import { ISong } from "../models";
import { usePlugins } from "../PluginsContext";
import { useAppSelector } from "../store/hooks";

const PluginPlaylist: React.FC = () => {
  const { pluginid } = useParams<"pluginid">();
  const { id } = useParams<"id">();
  const { plugins } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginid);
  const [tracks, setTracks] = React.useState<ISong[]>([]);
  const currentSong = useAppSelector((state) => state.song.currentSong);

  React.useEffect(() => {
    const getPlaylistTracks = async () => {
      if (plugin && plugin.hasDefined.getPlaylistTracks()) {
        const t = await plugin.remote.getPlaylistTracks({
          apiId: id,
          songs: [],
        });
        setTracks(t);
      }
    };

    getPlaylistTracks();
  }, [plugin, id]);
  const trackItems = tracks.map((track) => (
    <ListItem>
      <ListItemText>
        <Typography
          color={
            currentSong?.apiId === track.apiId ? "primary.main" : undefined
          }
          noWrap={true}
          dangerouslySetInnerHTML={{ __html: track.name }}
        ></Typography>
      </ListItemText>
    </ListItem>
  ));

  return <List>{trackItems}</List>;
};

export default PluginPlaylist;
