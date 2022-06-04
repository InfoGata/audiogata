import { IconButton, Popover, Slider, Box, useTheme } from "@mui/material";
import { SlowMotionVideo } from "@mui/icons-material";
import React from "react";
import { setPlaybackRate } from "../store/reducers/trackReducer";
import { useAppDispatch, useAppSelector } from "../store/hooks";

const PlaybackRate: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const playbackRate = useAppSelector((state) => state.track.playbackRate);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

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
  return (
    <>
      <IconButton size="small" onClick={onRateButtonClick}>
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
          {currentRate} %
        </Box>
      </Popover>
    </>
  );
};

export default PlaybackRate;
