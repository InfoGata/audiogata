import { Button } from "@/components/ui/button";
import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  changeRepeat,
  fastFoward,
  nextTrack,
  prevTrack,
  rewind,
  toggleIsPlaying,
  toggleShuffle,
} from "../store/reducers/trackReducer";
import { defaultSkipTime } from "../utils";
import PlaybackRate from "./PlaybackRate";
import Volume from "./Volume";
import {
  MdSkipNext,
  MdSkipPrevious,
  MdReplay5,
  MdForward5,
  MdForward10,
  MdForward30,
  MdFastForward,
  MdReplay10,
  MdReplay30,
  MdFastRewind,
  MdPlayArrow,
  MdPause,
  MdShuffle,
  MdRepeatOne,
  MdRepeat,
} from "react-icons/md";
import { cn } from "@/lib/utils";

const getForwardIcon = (time?: number) => {
  if (!time) {
    time = defaultSkipTime;
  }

  switch (time) {
    case 5:
      return <MdForward5 />;
    case 10:
      return <MdForward10 />;
    case 30:
      return <MdForward30 />;
    default:
      return <MdFastForward />;
  }
};

const getRewindIcon = (time?: number) => {
  if (!time) {
    time = defaultSkipTime;
  }

  switch (time) {
    case 5:
      return <MdReplay5 />;
    case 10:
      return <MdReplay10 />;
    case 30:
      return <MdReplay30 />;
    default:
      return <MdFastRewind />;
  }
};

const Controls: React.FC = () => {
  const repeat = useAppSelector((state) => state.track.repeat);
  const repeatOne = useAppSelector((state) => state.track.repeatOne);
  const shuffle = useAppSelector((state) => state.track.shuffle);
  const isPlaying = useAppSelector((state) => state.track.isPlaying);
  const showForwardAndRewind = useAppSelector(
    (state) => state.settings.showForwardAndRewind
  );
  const customForwardAndRewindTime = useAppSelector(
    (state) => state.settings.customFowardAndRewindTime
  );

  const dispatch = useAppDispatch();
  const playIcon = isPlaying ? <MdPause /> : <MdPlayArrow />;

  const onToggleShuffle = () => dispatch(toggleShuffle());
  const onChangeRepeat = () => dispatch(changeRepeat());
  const onPreviousClick = () => dispatch(prevTrack());
  const onNextClick = () => dispatch(nextTrack());
  const onTogglePlay = () => dispatch(toggleIsPlaying());
  const onFastFoward = () => dispatch(fastFoward());
  const onRewind = () => dispatch(rewind());

  return (
    <div>
      <Button size="icon" variant="ghost" onClick={onToggleShuffle}>
        <MdShuffle
          className={cn(shuffle ? "text-foreground" : "text-muted-foreground")}
        />
      </Button>
      {showForwardAndRewind && (
        <Button size="icon" variant="ghost" onClick={onRewind}>
          {getRewindIcon(customForwardAndRewindTime)}
        </Button>
      )}
      <Button size="icon" variant="ghost" onClick={onPreviousClick}>
        <MdSkipPrevious />
      </Button>
      <Button size="icon" variant="ghost" onClick={onTogglePlay}>
        {playIcon}
      </Button>
      <Button size="icon" variant="ghost" onClick={onNextClick}>
        <MdSkipNext />
      </Button>
      {showForwardAndRewind && (
        <Button size="icon" variant="ghost" onClick={onFastFoward}>
          {getForwardIcon(customForwardAndRewindTime)}
        </Button>
      )}
      <Button size="icon" variant="ghost" onClick={onChangeRepeat}>
        {repeatOne ? (
          <MdRepeatOne />
        ) : (
          <MdRepeat
            className={cn(repeat ? "text-foreground" : "text-muted-foreground")}
          />
        )}
      </Button>
      <Volume />
      <PlaybackRate />
    </div>
  );
};

export default Controls;
