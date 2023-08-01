import React from "react";
import TrackMenuContext from "../TrackMenuContext";
import { PlaylistInfo, Track } from "../plugintypes";
import { useAppSelector } from "../store/hooks";

interface TrackMenuArgs {
  playlists?: PlaylistInfo[];
  getListItems?: (track?: Track) => JSX.Element[];
  noQueueItem?: boolean;
}

const useTrackMenu = (args?: TrackMenuArgs) => {
  const { openTrackMenu, setPlaylists, setListElements, setNoQueue } =
    React.useContext(TrackMenuContext);
  const playlists = useAppSelector((state) => state.playlist.playlists);

  const openMenu = (
    event: React.MouseEvent<HTMLButtonElement>,
    track: Track
  ) => {
    openTrackMenu(event, track);
    setNoQueue(!!args?.noQueueItem);
    setPlaylists(args?.playlists ?? playlists);
    if (args?.getListItems) {
      const listItems = args.getListItems(track);
      setListElements(listItems);
    } else {
      setListElements([]);
    }
  };

  return { openMenu };
};

export default useTrackMenu;
