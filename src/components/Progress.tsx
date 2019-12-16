import { Slider, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { seek } from "../store/reducers/songReducer";
import { AppDispatch, AppState } from "../store/store";
import { formatSeconds } from "../utils";

const useStyles = makeStyles({
  container: {
    width: "100%",
  },
});

const Progress: React.FC = () => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [newElapsed, setNewElapsed] = React.useState(0);
  const classes = useStyles();
  const elapsed = useSelector((state: AppState) => state.song.elapsed);
  const currentSong = useSelector((state: AppState) => state.song.currentSong);
  const seekTime = useSelector((state: AppState) => state.song.seekTime);
  const dispatch = useDispatch<AppDispatch>();

  const onChange = (_: React.ChangeEvent<{}>, value: number | number[]) => {
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
    <>
      <Typography>{formatSeconds(displayElapsed)}</Typography>
      <div className={classes.container}>
        <Slider
          min={0}
          max={totalDuration}
          value={displayElapsed}
          onChange={onChange}
          onChangeCommitted={onChangeCommited}
        />
      </div>
      <Typography>{formatSeconds(totalDuration)}</Typography>
    </>
  );
};

export default Progress;
