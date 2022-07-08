import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import React from "react";
import { PlaylistInfo, Track } from "../plugintypes";
import { usePlugins } from "../PluginsContext";
import { getThumbnailImage, searchThumbnailSize } from "../utils";
import DOMPurify from "dompurify";

interface PlaylistSearchResultProps {
  playlist: PlaylistInfo;
  clearSearch: () => void;
  setTrackResults: (tracks: Track[]) => void;
}

const PlaylistSearchResult: React.FC<PlaylistSearchResultProps> = (props) => {
  const { clearSearch, playlist, setTrackResults } = props;
  const { plugins } = usePlugins();
  const sanitizer = DOMPurify.sanitize;

  const onClickPlaylist = async () => {
    clearSearch();

    const plugin = plugins.find((p) => p.id === playlist.pluginId);
    if (plugin && (await plugin.hasDefined.onGetPlaylistTracks())) {
      const tracks = await plugin.remote.onGetPlaylistTracks({ playlist });
      setTrackResults(tracks.items);
    }
  };
  const image = getThumbnailImage(playlist.images, searchThumbnailSize);
  return (
    <ListItem button={true} onClick={onClickPlaylist}>
      <ListItemAvatar>
        <Avatar alt={playlist.name} src={image} style={{ borderRadius: 0 }} />
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography
            dangerouslySetInnerHTML={{
              __html: sanitizer(playlist?.name || ""),
            }}
          />
        }
      />
    </ListItem>
  );
};

export default React.memo(PlaylistSearchResult);
