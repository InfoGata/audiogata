import { PlaylistPlay } from "@mui/icons-material";
import {
  Backdrop,
  Button,
  CircularProgress,
  Grid,
  List,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import React from "react";
import { useQuery } from "react-query";
import useTrackMenu from "../hooks/useTrackMenu";
import { PageInfo } from "../plugintypes";
import TrackSearchResult from "./TrackSearchResult";
import { addTrack } from "../store/reducers/trackReducer";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import PlaylistMenuItem from "./PlaylistMenuItem";
import usePagination from "../hooks/usePagination";
import { usePlugins } from "../PluginsContext";

interface TrackSearchResultsProps {
  pluginId: string;
  searchQuery: string;
  initialPage?: PageInfo;
}

const TrackSearchResults: React.FC<TrackSearchResultsProps> = (props) => {
  const { pluginId, searchQuery, initialPage } = props;
  const { plugins } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginId);
  const { closeMenu, openMenu, anchorEl, menuTrack } = useTrackMenu();
  const dispatch = useAppDispatch();
  const playlists = useAppSelector((state) => state.playlist.playlists);
  const [currentPage, setCurrentPage] = React.useState<PageInfo | undefined>(
    initialPage
  );
  const { page, hasNextPage, hasPreviousPage, onPreviousPage, onNextPage } =
    usePagination(currentPage);

  const search = async () => {
    if (plugin && (await plugin.hasDefined.onSearchTracks())) {
      const searchTracks = await plugin.remote.onSearchTracks({
        query: searchQuery,
        page: page,
      });
      console.log(searchTracks);
      setCurrentPage(searchTracks.pageInfo);
      return searchTracks.items;
    }
  };

  const query = useQuery(
    ["searchTracks", pluginId, searchQuery, page],
    search,
    { staleTime: 60 * 1000 }
  );

  const trackList = query.data?.map((track) => (
    <TrackSearchResult key={track.apiId} track={track} openMenu={openMenu} />
  ));

  const addTrackToQueue = () => {
    if (menuTrack) {
      dispatch(addTrack(menuTrack));
    }
    closeMenu();
  };

  return (
    <>
      <Backdrop open={query.isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <List>{trackList}</List>
      <Grid>
        {hasPreviousPage && <Button onClick={onPreviousPage}>Previous</Button>}
        {hasNextPage && <Button onClick={onNextPage}>Next</Button>}
      </Grid>
      <Menu open={Boolean(anchorEl)} onClose={closeMenu} anchorEl={anchorEl}>
        <MenuItem onClick={addTrackToQueue}>
          <ListItemIcon>
            <PlaylistPlay />
          </ListItemIcon>
          <ListItemText primary="Add To Queue" />
        </MenuItem>
        {playlists.map((p) => (
          <PlaylistMenuItem
            key={p.id}
            playlist={p}
            tracks={menuTrack ? [menuTrack] : []}
            closeMenu={closeMenu}
          />
        ))}
      </Menu>
    </>
  );
};

export default TrackSearchResults;
