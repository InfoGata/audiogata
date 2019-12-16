import { IconButton, Slider } from "@material-ui/core";
import { VolumeOff, VolumeUp } from "@material-ui/icons";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setVolume, toggleMute } from "../store/reducers/songReducer";
import { AppDispatch, AppState } from "../store/store";

const Volume: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const muted = useSelector((state: AppState) => state.song.mute);
  const volume = useSelector((state: AppState) => state.song.volume);

  const onToggleMute = () => dispatch(toggleMute());
  const onVolumeChange = (
    _: React.ChangeEvent<{}>,
    newVolume: number | number[],
  ) => {
    const actualVolume = (newVolume as number) / 100;
    dispatch(setVolume(actualVolume));
  };

  const volumeIcon = volume === 0 || muted ? <VolumeOff /> : <VolumeUp />;
  return (
    <>
      <IconButton onClick={onToggleMute}>{volumeIcon}</IconButton>
      <div>
        <Slider
          min={0}
          max={100}
          value={volume * 100}
          onChange={onVolumeChange}
        />
      </div>
    </>
  );
};

export default Volume;
