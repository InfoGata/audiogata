import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import React from "react";
import { PluginInfo } from "../plugintypes";
import { usePlugins } from "../PluginsContext";

interface ConfirmPluginDialogProps {
  open: boolean;
  plugins: PluginInfo[];
  handleClose: () => void;
  afterConfirm?: () => void;
  afterCancel?: () => void;
}

const ConfirmPluginDialog: React.FC<ConfirmPluginDialogProps> = (props) => {
  const { open, plugins, handleClose, afterConfirm, afterCancel } = props;
  const [checked, setChecked] = React.useState<Set<string>>(new Set());
  const { addPlugin } = usePlugins();

  React.useEffect(() => {
    setChecked(new Set(plugins.map((p) => p.id || "")));
  }, [plugins]);

  const onConfirm = async () => {
    const savedPlugins = plugins.filter((p) => checked.has(p.id || ""));
    for (const plugin of savedPlugins) {
      if (plugin) {
        await addPlugin(plugin);
      }
    }

    if (afterConfirm) {
      afterConfirm();
    }
    handleClose();
  };

  const onChange =
    (pluginId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setChecked((prev) => {
        const next = new Set(prev);
        e.target.checked ? next.add(pluginId) : next.delete(pluginId);
        return next;
      });
    };

  const info = plugins.map((p) => (
    <ListItem key={p.id}>
      {plugins.length > 1 && (
        <Checkbox
          edge="start"
          checked={checked.has(p.id || "")}
          tabIndex={-1}
          onChange={onChange(p.id || "")}
        />
      )}
      <ListItemText
        primary={`${p.name} ${p.version || ""}`}
        secondary={p.description}
      />
    </ListItem>
  ));

  const onCancel = () => {
    if (afterCancel) {
      afterCancel();
    }
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Add Plugins</DialogTitle>
      <List>{info}</List>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm}>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmPluginDialog;
