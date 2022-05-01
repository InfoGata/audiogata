import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Typography,
} from "@mui/material";
import React from "react";
import { IPlaylist, ISong } from "../models";
import { usePlugins } from "../PluginsContext";
import { getThumbnailImage, searchThumbnailSize } from "../utils";

interface IPlaylistResultProps {
  playlist: IPlaylist;
  clearSearch: () => void;
  setTrackResults: (songs: ISong[]) => void;
}

const PlaylistSearchResult: React.FC<IPlaylistResultProps> = (props) => {
  const { clearSearch, playlist, setTrackResults } = props;
  const { plugins } = usePlugins();

  const onClickPlaylist = async () => {
    clearSearch();

    const plugin = plugins.find((p) => p.id === playlist.from);
    if (plugin && (await plugin.hasDefined.getPlaylistTracks())) {
      const tracks = await plugin.remote.getPlaylistTracks(playlist);
      setTrackResults(tracks);
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
            dangerouslySetInnerHTML={{ __html: playlist?.name || "" }}
          />
        }
      />
    </ListItem>
  );
};

export default React.memo(PlaylistSearchResult);
