import React from "react";
import usePlugins from "../hooks/usePlugins";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setPlaybackRate } from "../store/reducers/trackReducer";
import { MdSlowMotionVideo } from "react-icons/md";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const PlaybackRate: React.FC = () => {
  const dispatch = useAppDispatch();
  const playbackRate = useAppSelector((state) => state.track.playbackRate);
  const currentPluginId = useAppSelector(
    (state) => state.track.currentTrack?.pluginId
  );
  const { plugins } = usePlugins();
  const plugin = plugins.find((p) => p.id === currentPluginId);
  const [enabled, setEnabled] = React.useState(true);

  React.useEffect(() => {
    const enablePlaybackrate = async () => {
      if (plugin) {
        if (
          (await plugin.hasDefined.onPlay()) &&
          !(await plugin.hasDefined.onSetPlaybackRate())
        ) {
          setEnabled(false);
        } else {
          setEnabled(true);
        }
      }
    };
    enablePlaybackrate();
  }, [plugin, currentPluginId]);

  const onChangePlaybackRate = (value: number[]) => {
    const newRate = value[0];
    const actualRate = newRate / 100;
    dispatch(setPlaybackRate(actualRate));
  };

  const currentRate = (playbackRate || 1.0) * 100;

  const formattedRate = new Intl.NumberFormat(undefined, {
    style: "percent",
  }).format(playbackRate || 0);
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button disabled={!enabled} size="icon" variant="ghost">
          <MdSlowMotionVideo />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <Slider
          orientation="horizontal"
          min={0}
          max={200}
          value={[currentRate]}
          onValueChange={onChangePlaybackRate}
        />
        {formattedRate}
      </PopoverContent>
    </Popover>
  );
};

export default PlaybackRate;
