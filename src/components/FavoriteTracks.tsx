import { useLiveQuery } from "dexie-react-hooks";
import React from "react";
import { db } from "../database";
import useTrackMenu from "../hooks/useTrackMenu";
import { Track } from "../plugintypes";
import { useAppDispatch } from "../store/hooks";
import { setTrack, setTracks } from "../store/reducers/trackReducer";
import TrackList from "./TrackList";

const FavoriteTracks: React.FC = () => {
  const dispatch = useAppDispatch();

  const { openMenu } = useTrackMenu();

  const tracks = useLiveQuery(() => db.favoriteTracks.toArray());

  const onTrackClick = (track: Track) => {
    dispatch(setTrack(track));
    dispatch(setTracks(tracks || []));
  };

  return (
    <TrackList
      tracks={tracks || []}
      openMenu={openMenu}
      onTrackClick={onTrackClick}
    />
  );
};

export default FavoriteTracks;
