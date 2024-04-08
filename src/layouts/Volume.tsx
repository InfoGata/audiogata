import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setVolume } from "../store/reducers/trackReducer";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { MdVolumeOff, MdVolumeUp } from "react-icons/md";

const Volume: React.FC = () => {
  const dispatch = useAppDispatch();
  const muted = useAppSelector((state) => state.track.mute);
  const volume = useAppSelector((state) => state.track.volume);

  const onVolumeChange = (value: number[]) => {
    const actualVolume = value[0] / 100;
    dispatch(setVolume(actualVolume));
  };

  const volumeIcon = volume === 0 || muted ? <MdVolumeOff /> : <MdVolumeUp />;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="icon" variant="ghost">
          {volumeIcon}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Slider
          orientation="horizontal"
          min={0}
          max={100}
          value={[volume * 100]}
          onValueChange={onVolumeChange}
        />
      </PopoverContent>
    </Popover>
  );
};

export default Volume;
