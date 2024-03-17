import React from "react";
import { PlaylistInfo, Track } from "./plugintypes";

export interface TrackMenuInterface {
  openTrackMenu: (
    event: React.MouseEvent<HTMLButtonElement>,
    track: Track
  ) => Promise<void>;
  setPlaylists: React.Dispatch<React.SetStateAction<PlaylistInfo[]>>;
  setListElements: React.Dispatch<React.SetStateAction<JSX.Element[]>>;
  setNoQueue: React.Dispatch<React.SetStateAction<boolean>>;
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const TrackMenuContext = React.createContext<TrackMenuInterface>(undefined!);
export default TrackMenuContext;
