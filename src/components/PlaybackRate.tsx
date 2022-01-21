import { IconButton, Popover, Slider } from "@mui/material";
import { SlowMotionVideo } from "@mui/icons-material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPlaybackRate } from "../store/reducers/songReducer";
import { AppDispatch, AppState } from "../store/store";
import { makeStyles } from "tss-react/mui";

const useStyles = makeStyles()((theme) => ({
  rateBar: {
    height: "100px",
    padding: theme.spacing(1),
  },
}));

const PlaybackRate: React.FC = () => {
  const { classes } = useStyles();
  const dispatch = useDispatch<AppDispatch>();
  const playbackRate = useSelector(
    (state: AppState) => state.song.playbackRate
  );
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
        <div className={classes.rateBar}>
          <Slider
            orientation="vertical"
            aria-labelledby="vertical-slider"
            min={0}
            max={200}
            value={currentRate}
            onChange={onPlaybackRate}
          />
          {currentRate} %
        </div>
      </Popover>
    </>
  );
};

export default PlaybackRate;
