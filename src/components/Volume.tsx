import { VolumeOff, VolumeUp } from "@mui/icons-material";
import { Box, IconButton, Popover, Slider } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setVolume } from "../store/reducers/trackReducer";

const Volume: React.FC = () => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const muted = useAppSelector((state) => state.track.mute);
  const volume = useAppSelector((state) => state.track.volume);
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
