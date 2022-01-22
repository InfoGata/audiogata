import { IconButton, Popover, Slider, Box, useTheme } from "@mui/material";
import { VolumeOff, VolumeUp } from "@mui/icons-material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setVolume } from "../store/reducers/songReducer";
import { AppDispatch, AppState } from "../store/store";

const Volume: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const muted = useSelector((state: AppState) => state.song.mute);
  const volume = useSelector((state: AppState) => state.song.volume);
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(
    null
  );

  const onVolumeChange = (_: Event, newVolume: number | number[]) => {
    const actualVolume = (newVolume as number) / 100;
    dispatch(setVolume(actualVolume));
  };

  const onVolumeButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const onVolumeButtonClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;
  const volumeIcon = volume === 0 || muted ? <VolumeOff /> : <VolumeUp />;
  return (
    <>
      <IconButton size="small" onClick={onVolumeButtonClick}>
        {volumeIcon}
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={onVolumeButtonClose}
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
            max={100}
            value={volume * 100}
            onChange={onVolumeChange}
          />
        </Box>
      </Popover>
    </>
  );
};

export default Volume;
