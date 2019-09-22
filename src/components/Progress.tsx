import {
  createStyles,
  Slider,
  WithStyles,
  withStyles,
} from "@material-ui/core";
import React from "react";
import { formatSeconds } from "../utils";

const styles = createStyles({
  container: {
    width: 500,
  },
});

interface IProps extends WithStyles<typeof styles> {
  elapsed: number;
  total: number;
  onSeek: (newTime: number) => void;
}

const Progress: React.FC<IProps> = props => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [newElapsed, setNewElapsed] = React.useState(0);

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
    <div className="progress">
      <span className="player__time-elapsed">
        {formatSeconds(elapsed)} / {formatSeconds(props.total)}
      </span>
      <div className={props.classes.container}>
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

export default withStyles(styles)(Progress);
