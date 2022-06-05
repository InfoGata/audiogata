import { Avatar, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
import React from "react";
import { Album, Track } from "../plugintypes";
import { usePlugins } from "../PluginsContext";
import { getThumbnailImage, searchThumbnailSize } from "../utils";

interface AlbumSearchResultProps {
  album: Album;
  clearSearch: () => void;
  setTrackResults: (tracks: Track[]) => void;
}

const AlbumSearchResult: React.FC<AlbumSearchResultProps> = (props) => {
  const { plugins } = usePlugins();
  const { album, clearSearch, setTrackResults } = props;

  const onClickAlbum = async () => {
    clearSearch();

    const plugin = plugins.find((p) => p.id === album.from);
    if (plugin && (await plugin.hasDefined.getAlbumTracks())) {
      const tracks = await plugin.remote.getAlbumTracks(album);
      setTrackResults(tracks);
    }
  };

  const image = getThumbnailImage(album.images, searchThumbnailSize);

  return (
    <ListItem button={true} onClick={onClickAlbum}>
      <ListItemAvatar>
        <Avatar alt={album.name} src={image} style={{ borderRadius: 0 }} />
      </ListItemAvatar>
      <ListItemText>
        {album.name} - {album.artistName}
      </ListItemText>
    </ListItem>
  );
};

export default React.memo(AlbumSearchResult);
