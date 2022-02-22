import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from "@mui/material";
import React from "react";
import { usePlugins } from "../PluginsContext";
import { useAppDispatch } from "../store/hooks";
import { updateFrom } from "../store/reducers/songReducer";

interface SelectionEditProps {
  trackIdSet: Set<string>;
  open: boolean;
  onClose: () => void;
}

const SelectionEditDialog: React.FC<SelectionEditProps> = (props) => {
  const { trackIdSet, onClose, open } = props;
  const [from, setFrom] = React.useState("");
  const dispatch = useAppDispatch();
  const { plugins } = usePlugins();
  const onSave = () => {
    if (from) {
      dispatch(updateFrom({ updateIds: trackIdSet, from }));
    }
    onClose();
  };

  const optionsTuple: [string, string][] = [
    ["soundcloud", "SoundCloud"],
    ["spotify", "Spotify"],
  ];
  const options = optionsTuple.concat(
    plugins.map((p) => [p.id || "", p.name || ""])
  );
  const optionsComponents = options.map((option) => (
    <MenuItem key={option[0]} value={option[0]}>
      {option[1]}
    </MenuItem>
  ));

  const onSelectFromChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    setFrom(value);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Tracks</DialogTitle>
      <DialogContent>
        <DialogContentText>Editing {trackIdSet.size} tracks</DialogContentText>
        <FormControl fullWidth>
          <InputLabel id="select-from-dialog">From</InputLabel>
          <Select
            id="select-form-dialog"
            value={from}
            label="From"
            onChange={onSelectFromChange}
          >
            {optionsComponents}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectionEditDialog;
