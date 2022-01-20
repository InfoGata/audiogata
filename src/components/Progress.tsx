import { Grid, Slider, Typography } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { seek } from "../store/reducers/songReducer";
import { AppDispatch, AppState } from "../store/store";
import { formatSeconds } from "../utils";

const Progress: React.FC = () => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [newElapsed, setNewElapsed] = React.useState(0);
  const elapsed = useSelector((state: AppState) => state.song.elapsed);
  const currentSong = useSelector((state: AppState) => state.song.currentSong);
  const seekTime = useSelector((state: AppState) => state.song.seekTime);
  const dispatch = useDispatch<AppDispatch>();

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
  const totalDuration = currentSong && currentSong.duration;
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
