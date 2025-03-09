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

interface PlaybackRateProps {
  mobile?: boolean;
}

const PLAYBACK_RATES = [
  { label: "0.25×", value: 0.25 },
  { label: "0.5×", value: 0.5 },
  { label: "0.75×", value: 0.75 },
  { label: "Normal", value: 1 },
  { label: "1.25×", value: 1.25 },
  { label: "1.5×", value: 1.5 },
  { label: "1.75×", value: 1.75 },
  { label: "2×", value: 2 },
];

const PlaybackRate: React.FC<PlaybackRateProps> = ({ mobile }) => {
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

  const setExactPlaybackRate = (rate: number) => {
    dispatch(setPlaybackRate(rate));
  };

  const currentRate = (playbackRate || 1.0) * 100;
  const formattedRate = new Intl.NumberFormat(undefined, {
    style: "percent",
  }).format(playbackRate || 0);

  const PlaybackControls = () => (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-between items-center">
        <MdSlowMotionVideo className="h-5 w-5" />
        <span className="text-sm font-medium">{formattedRate}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {PLAYBACK_RATES.map((rate) => (
          <Button
            key={rate.value}
            variant={playbackRate === rate.value ? "default" : "outline"}
            size="sm"
            className="h-7"
            onClick={() => setExactPlaybackRate(rate.value)}
            disabled={!enabled}
          >
            {rate.label}
          </Button>
        ))}
      </div>
      <Slider
        orientation="horizontal"
        min={0}
        max={200}
        value={[currentRate]}
        onValueChange={onChangePlaybackRate}
        disabled={!enabled}
        className="mt-2"
      />
    </div>
  );

  if (mobile) {
    return <PlaybackControls />;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button disabled={!enabled} size="icon" variant="ghost">
          <MdSlowMotionVideo />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-4 gap-2">
            {PLAYBACK_RATES.map((rate) => (
              <Button
                key={rate.value}
                variant={playbackRate === rate.value ? "default" : "outline"}
                size="sm"
                className="h-7"
                onClick={() => setExactPlaybackRate(rate.value)}
                disabled={!enabled}
              >
                {rate.label}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Slider
              orientation="horizontal"
              min={0}
              max={200}
              value={[currentRate]}
              onValueChange={onChangePlaybackRate}
              disabled={!enabled}
            />
            <span className="min-w-[3ch] text-right">{formattedRate}</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default PlaybackRate;
