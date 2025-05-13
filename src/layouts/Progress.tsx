import { Slider } from "@/components/ui/slider";
import { formatSeconds } from "@infogata/utils";
import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { seek } from "../store/reducers/trackReducer";

const Progress: React.FC = () => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [newElapsed, setNewElapsed] = React.useState(0);
  const elapsed = useAppSelector((state) => state.track.elapsed);
  const currentTrack = useAppSelector((state) => state.track.currentTrack);
  const seekTime = useAppSelector((state) => state.track.seekTime);
  const dispatch = useAppDispatch();

  const onChange = (value: number[]) => {
    setIsDragging(true);
    setNewElapsed(value[0]);
  };

  const onChangeCommited = (value: number[]) => {
    setIsDragging(false);
    const newSeekTime = value[0];
    dispatch(seek(newSeekTime));
  };

  const displayElapsed = isDragging ? newElapsed : seekTime || elapsed || 0;
  const totalDuration = currentTrack?.duration || 0;

  return (
    <div className="flex flex-row w-full items-center gap-x-2 px-2 py-1">
      <span className="text-xs text-muted-foreground min-w-[40px] text-right">
        {formatSeconds(displayElapsed)}
      </span>
      <Slider
        min={0}
        max={totalDuration}
        value={[displayElapsed]}
        onValueChange={onChange}
        onValueCommit={onChangeCommited}
        className="h-1"
      />
      <span className="text-xs text-muted-foreground min-w-[40px]">
        {formatSeconds(totalDuration)}
      </span>
    </div>
  );
};

export default Progress;
