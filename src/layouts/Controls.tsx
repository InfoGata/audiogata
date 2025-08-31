import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

const getForwardIcon = (time?: number) => {
  if (!time) {
    time = defaultSkipTime;
  }

  switch (time) {
    case 5:
      return <MdForward5 className="size-4 sm:size-5" />;
    case 10:
      return <MdForward10 className="size-4 sm:size-5" />;
    case 30:
      return <MdForward30 className="size-4 sm:size-5" />;
    default:
      return <MdFastForward className="size-4 sm:size-5" />;
  }
};

const getRewindIcon = (time?: number) => {
  if (!time) {
    time = defaultSkipTime;
  }

  switch (time) {
    case 5:
      return <MdReplay5 className="size-4 sm:size-5" />;
    case 10:
      return <MdReplay10 className="size-4 sm:size-5" />;
    case 30:
      return <MdReplay30 className="size-4 sm:size-5" />;
    default:
      return <MdFastRewind className="size-4 sm:size-5" />;
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
  const playIcon = isPlaying ? (
    <MdPause className="size-6 sm:size-8" />
  ) : (
    <MdPlayArrow className="size-6 sm:size-8" />
  );

  const onToggleShuffle = () => dispatch(toggleShuffle());
  const onChangeRepeat = () => dispatch(changeRepeat());
  const onPreviousClick = () => dispatch(prevTrack());
  const onNextClick = () => dispatch(nextTrack());
  const onTogglePlay = () => dispatch(toggleIsPlaying());
  const onFastFoward = () => dispatch(fastFoward());
  const onRewind = () => dispatch(rewind());

  return (
    <div className="flex items-center gap-x-1 sm:gap-x-2">
      <Button
        size="icon"
        variant="ghost"
        className="size-8 sm:size-10 text-muted-foreground hover:text-foreground"
        onClick={onToggleShuffle}
      >
        <MdShuffle
          className={cn(
            "size-4 sm:size-5",
            shuffle ? "text-primary" : "text-muted-foreground"
          )}
        />
      </Button>

      {showForwardAndRewind && (
        <Button
          size="icon"
          variant="ghost"
          className="size-8 sm:size-10 text-muted-foreground hover:text-foreground"
          onClick={onRewind}
        >
          {getRewindIcon(customForwardAndRewindTime)}
        </Button>
      )}

      <Button
        size="icon"
        variant="ghost"
        className="size-8 sm:size-10 text-muted-foreground hover:text-foreground"
        onClick={onPreviousClick}
      >
        <MdSkipPrevious className="size-5 sm:size-7" />
      </Button>

      <Button
        size="icon"
        variant="ghost"
        className="size-9 sm:size-10 hover:scale-105 transition-transform"
        onClick={onTogglePlay}
      >
        {playIcon}
      </Button>

      <Button
        size="icon"
        variant="ghost"
        className="size-8 sm:size-10 text-muted-foreground hover:text-foreground"
        onClick={onNextClick}
      >
        <MdSkipNext className="size-5 sm:size-7" />
      </Button>

      {showForwardAndRewind && (
        <Button
          size="icon"
          variant="ghost"
          className="size-8 sm:size-10 text-muted-foreground hover:text-foreground"
          onClick={onFastFoward}
        >
          {getForwardIcon(customForwardAndRewindTime)}
        </Button>
      )}

      <Button
        size="icon"
        variant="ghost"
        className="size-8 sm:size-10 text-muted-foreground hover:text-foreground"
        onClick={onChangeRepeat}
      >
        {repeatOne ? (
          <MdRepeatOne className="size-4 sm:size-5 text-primary" />
        ) : (
          <MdRepeat
            className={cn(
              "size-4 sm:size-5",
              repeat ? "text-primary" : "text-muted-foreground"
            )}
          />
        )}
      </Button>
    </div>
  );
};

export default Controls;
