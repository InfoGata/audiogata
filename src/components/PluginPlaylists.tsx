import React from "react";
import { usePlugins } from "../PluginsContext";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { IPlaylist } from "../models";

const PluginPlaylists: React.FC = () => {
  const { plugins } = usePlugins();
  const { id } = useParams<"id">();
  const [playlists, setPlaylists] = React.useState<IPlaylist[]>([]);
  const plugin = plugins.find((p) => p.id === id);

  React.useEffect(() => {
    const getPlaylists = async () => {
      if (plugin && (await plugin.hasDefined.getUserPlaylists())) {
        const p = await plugin.remote.getUserPlaylists();
        setPlaylists(p);
      }
    };
    getPlaylists();
  }, [plugin]);

  const playlistLinks = playlists.map((m) => (
    <Link to={`/plugins/${id}/playlists/${m.apiId}`}>{m.name}</Link>
  ));
  return plugin ? <div>{playlistLinks}</div> : <>Not Found</>;
};

export default PluginPlaylists;
