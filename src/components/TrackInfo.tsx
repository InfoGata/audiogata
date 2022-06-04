import {
  Button,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import React from "react";
import { Track } from "../types";
import { usePlugins } from "../PluginsContext";
import { useAppDispatch } from "../store/hooks";
import { updateTrack } from "../store/reducers/trackReducer";

interface TrackInfoProps {
  track: Track;
}

const TrackInfo: React.FC<TrackInfoProps> = (props) => {
  const { track } = props;
  const dispatch = useAppDispatch();
  const { plugins } = usePlugins();
  const [editing, setEditing] = React.useState(false);
  const [from, setFrom] = React.useState(track.from);
  const options = plugins.map((p) => [p.id || "", p.name || ""]);
  const optionsComponents = options.map((option) => (
    <MenuItem key={option[0]} value={option[0]}>
      {option[1]}
    </MenuItem>
  ));
  const onSave = () => {
    const updatedTrack: Track = { ...track, from };
    dispatch(updateTrack(updatedTrack));
    setEditing(false);
  };
  const onCancel = () => {
    setFrom(track.from);
    setEditing(false);
  };
  const editComponent = (
    <Grid>
      <Button onClick={onCancel}>Cancel</Button>
      <Button onClick={onSave}>Save</Button>
    </Grid>
  );
  const onFromChange = (e: SelectChangeEvent<string>) => {
    const newValue = e.target.value;
    setFrom(newValue);
    setEditing(newValue !== track.from);
  };
  return (
    <>
      <p>{track.name}</p>
      <Select value={from} onChange={onFromChange}>
        {optionsComponents}
      </Select>
      {editing && editComponent}
    </>
  );
};

export default TrackInfo;
