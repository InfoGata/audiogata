import { Grid, Slider, Typography } from "@mui/material";
import React from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { seek } from "../store/reducers/trackReducer";
import { formatSeconds } from "../utils";

const Progress: React.FC = () => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [newElapsed, setNewElapsed] = React.useState(0);
  const elapsed = useAppSelector((state) => state.track.elapsed);
  const currentTrack = useAppSelector((state) => state.track.currentTrack);
  const seekTime = useAppSelector((state) => state.track.seekTime);
  const dispatch = useAppDispatch();

  const onChange = (_: Event, value: number | number[]) => {
    setIsDragging(true);
    setNewElapsed(value as number);
  };

  const onChangeCommited = (_: any, value: number | number[]) => {
    setIsDragging(false);
    const newSeekTime = value as number;
    dispatch(seek(newSeekTime));
  };

  const displayElapsed = isDragging ? newElapsed : seekTime || elapsed || 0;
  const totalDuration = currentTrack && currentTrack.duration;
  return (
    <Grid item={true} container={true} spacing={1}>
      <Grid item={true}>
        <Typography variant="body2">{formatSeconds(displayElapsed)}</Typography>
      </Grid>
      <Grid item={true} xs={true}>
        <Slider
          min={0}
          max={totalDuration}
          value={displayElapsed}
          onChange={onChange}
          onChangeCommitted={onChangeCommited}
        />
      </Grid>
      <Grid item={true}>
        <Typography variant="body2">{formatSeconds(totalDuration)}</Typography>
      </Grid>
    </Grid>
  );
};

export default Progress;
