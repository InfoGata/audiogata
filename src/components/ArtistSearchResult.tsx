import { Avatar, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
import React from "react";
import { Album, Artist } from "../plugintypes";
import { usePlugins } from "../PluginsContext";
import { getThumbnailImage, searchThumbnailSize } from "../utils";

interface ArtistSearchResultProps {
  artist: Artist;
  clearSearch: () => void;
  setAlbumResults: (albums: Album[]) => void;
}

const ArtistSearchResult: React.FC<ArtistSearchResultProps> = (props) => {
  const { plugins } = usePlugins();
  const { artist, clearSearch, setAlbumResults } = props;

  const onClickArtist = async () => {
    clearSearch();

    const plugin = plugins.find((p) => p.id === artist.pluginId);
    if (plugin && (await plugin.hasDefined.onGetArtistAlbums())) {
      const albums = await plugin.remote.onGetArtistAlbums(artist);
      setAlbumResults(albums);
    }
  };

  const image = getThumbnailImage(artist.images, searchThumbnailSize);
  return (
    <ListItem button={true} onClick={onClickArtist}>
      <ListItemAvatar>
        <Avatar alt={artist.name} src={image} style={{ borderRadius: 0 }} />
      </ListItemAvatar>
      <ListItemText>{artist.name}</ListItemText>
    </ListItem>
  );
};

export default React.memo(ArtistSearchResult);
