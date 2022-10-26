import { IconButton, Popover, Slider, Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { SlowMotionVideo } from "@mui/icons-material";
import React from "react";
import { setPlaybackRate } from "../store/reducers/trackReducer";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { usePlugins } from "../PluginsContext";

const PlaybackRate: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const playbackRate = useAppSelector((state) => state.track.playbackRate);
  const currentPluginId = useAppSelector(
    (state) => state.track.currentTrack?.pluginId
  );
  const { plugins } = usePlugins();
  const plugin = plugins.find((p) => p.id === currentPluginId);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );
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

  const onPlaybackRate = (_: Event, newRate: number | number[]) => {
    const actualRate = (newRate as number) / 100;
    dispatch(setPlaybackRate(actualRate));
  };

  const onRateButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const onRateButtonClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  const currentRate = (playbackRate || 1.0) * 100;

  const formattedRate = new Intl.NumberFormat(undefined, {
    style: "percent",
  }).format(playbackRate || 0);
  return (
    <>
      <IconButton disabled={!enabled} size="small" onClick={onRateButtonClick}>
        <SlowMotionVideo />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={onRateButtonClose}
        anchorOrigin={{
          horizontal: "center",
          vertical: "top",
        }}
        transformOrigin={{
          horizontal: "center",
          vertical: "bottom",
        }}
      >
        <Box sx={{ height: "100px", padding: theme.spacing(1) }}>
          <Slider
            orientation="vertical"
            aria-labelledby="vertical-slider"
            min={0}
            max={200}
            value={currentRate}
            onChange={onPlaybackRate}
          />
          {formattedRate}
        </Box>
      </Popover>
    </>
  );
};

export default PlaybackRate;
