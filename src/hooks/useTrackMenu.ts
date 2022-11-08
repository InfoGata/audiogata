import React from "react";
import { PlaylistInfo, Track } from "../plugintypes";
import { useAppSelector } from "../store/hooks";
import TrackMenuContext from "../TrackMenuContext";
interface TrackMenuArgs {
  playlists?: PlaylistInfo[];
  listItems?: JSX.Element[];
  noQueueItem?: boolean;
}

const useTrackMenu = (args?: TrackMenuArgs) => {
  const {
    openTrackMenu,
    menuTrack,
    setPlaylists,
    setListElements,
    setNoQueue,
  } = React.useContext(TrackMenuContext);
  const playlists = useAppSelector((state) => state.playlist.playlists);

  const openMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    track: Track
  ) => {
    openTrackMenu(event, track);
    setNoQueue(!!args?.noQueueItem);
    setPlaylists(args?.playlists ?? playlists);
    setListElements(args?.listItems ?? []);
  };

  return { openMenu, menuTrack };
};

export default useTrackMenu;
