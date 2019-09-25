import { makeStyles, Slider } from "@material-ui/core";
import React from "react";
import { useSelector } from "react-redux";
import { AppState } from "../store/store";
import { formatSeconds } from "../utils";

const useStyles = makeStyles({
  container: {
    width: 500,
  },
});

interface IProps {
  total: number;
  onSeek: (newTime: number) => void;
}

const Progress: React.FC<IProps> = props => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [newElapsed, setNewElapsed] = React.useState(0);
  const classes = useStyles();
  const elapsed = useSelector((state: AppState) => state.song.elapsed);
  const currentSong = useSelector((state: AppState) => state.song.currentSong);

  function onChange(_: React.ChangeEvent<{}>, value: number | number[]) {
    setIsDragging(true);
    setNewElapsed(value as number);
  }

  function onChangeCommited(e: any, value: number | number[]) {
    setIsDragging(false);
    props.onSeek(value as number);
  }

  const displayElapsed = isDragging ? newElapsed : elapsed || 0;
  const totalDuration =
    currentSong && currentSong.duration ? currentSong.duration : props.total;
  return (
    <div>
      {formatSeconds(displayElapsed)} / {formatSeconds(totalDuration)}
      <div className={classes.container}>
        <Slider
          min={0}
          max={totalDuration}
          value={elapsed}
          onChange={onChange}
          onChangeCommitted={onChangeCommited}
        />
      </div>
    </div>
  );
};

export default Progress;
