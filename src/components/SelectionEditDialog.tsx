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

interface SelectionEditProps {
  open: boolean;
  onSave: (pluginId?: string) => void;
  onClose: () => void;
}

const SelectionEditDialog: React.FC<SelectionEditProps> = (props) => {
  const { onClose, open, onSave } = props;
  const [pluginId, setPluginId] = React.useState("");
  const { plugins } = usePlugins();
  const onSaveClick = () => {
    onSave(pluginId);
    onClose();
  };

  const options = plugins.map((p) => [p.id || "", p.name || ""]);
  const optionsComponents = options.map((option) => (
    <MenuItem key={option[0]} value={option[0]}>
      {option[1]}
    </MenuItem>
  ));

  const onSelectPluginChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    setPluginId(value);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Tracks</DialogTitle>
      <DialogContent>
        <DialogContentText>Change Plugin</DialogContentText>
        <FormControl fullWidth>
          <InputLabel id="select-plugin-dialog">Plugin</InputLabel>
          <Select
            id="select-plugin-dialog"
            value={pluginId}
            label="Plugin"
            onChange={onSelectPluginChange}
          >
            {optionsComponents}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSaveClick}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(SelectionEditDialog);
