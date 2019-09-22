import { makeStyles, Slider } from "@material-ui/core";
import React from "react";
import { formatSeconds } from "../utils";

const useStyles = makeStyles({
  container: {
    width: 500,
  },
});

interface IProps {
  elapsed: number;
  total: number;
  onSeek: (newTime: number) => void;
}

const Progress: React.FC<IProps> = props => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [newElapsed, setNewElapsed] = React.useState(0);
  const classes = useStyles();

  function onChange(_: React.ChangeEvent<{}>, value: number | number[]) {
    setIsDragging(true);
    setNewElapsed(value as number);
  }

  function onChangeCommited(e: any, value: number | number[]) {
    setIsDragging(false);
    props.onSeek(value as number);
  }

  const elapsed = isDragging ? newElapsed : props.elapsed;
  return (
    <div>
      {formatSeconds(elapsed)} / {formatSeconds(props.total)}
      <div className={classes.container}>
        <Slider
          min={0}
          max={props.total}
          value={elapsed}
          onChange={onChange}
          onChangeCommitted={onChangeCommited}
        />
      </div>
    </div>
  );
};

export default Progress;
