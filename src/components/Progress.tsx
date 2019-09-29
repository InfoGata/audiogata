import { Slider } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";
import { useSelector } from "react-redux";
import { AppState } from "../store/store";
import { formatSeconds } from "../utils";

const useStyles = makeStyles({
  container: {
    width: 500,
  },
});

const Progress: React.FC = () => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [newElapsed, setNewElapsed] = React.useState(0);
  const classes = useStyles();
  const elapsed = useSelector((state: AppState) => state.song.elapsed);
  const currentSong = useSelector((state: AppState) => state.song.currentSong);

  const onChange = (_: React.ChangeEvent<{}>, value: number | number[]) => {
    setIsDragging(true);
    setNewElapsed(value as number);
  };

  const onChangeCommited = (e: any, value: number | number[]) => {
    setIsDragging(false);
  };

  const displayElapsed = isDragging ? newElapsed : elapsed || 0;
  const totalDuration = currentSong && currentSong.duration;
  return (
    <div>
      {formatSeconds(displayElapsed)} / {formatSeconds(totalDuration)}
      <div className={classes.container}>
        <Slider
          min={0}
          max={totalDuration}
          value={displayElapsed}
          onChange={onChange}
          onChangeCommitted={onChangeCommited}
        />
      </div>
    </div>
  );
};

export default Progress;
