import { createStyles, WithStyles, withStyles } from "@material-ui/core";
import Slider from "@material-ui/lab/Slider";
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

  function onChange(e: React.ChangeEvent<{}>, value: number) {
    if (isDragging) {
      setNewElapsed(value);
    } else {
      props.onSeek(value);
    }
  }

  function onMouseDown() {
    setIsDragging(true);
    setNewElapsed(props.elapsed);
  }

  function onMouseUp() {
    props.onSeek(newElapsed);
    setIsDragging(false);
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
          onDragStart={onMouseDown}
          onDragEnd={onMouseUp}
        />
      </div>
    </div>
  );
};

export default withStyles(styles)(Progress);
