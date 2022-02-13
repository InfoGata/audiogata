import { Grid, IconButton } from "@mui/material";
import React from "react";
import { PluginFrame } from "../PluginsContext";
import { Delete } from "@mui/icons-material";

interface PluginContainerProps {
  plugin: PluginFrame;
  deletePlugin: (plugin: PluginFrame) => Promise<void>;
}

const PluginContainer: React.FC<PluginContainerProps> = (props) => {
  const { plugin, deletePlugin } = props;

  const onDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this plugin"
    );
    if (confirmDelete) {
      await deletePlugin(plugin);
    }
  };
  return (
    <Grid key={plugin.id}>
      {plugin.name}
      <IconButton onClick={onDelete}>
        <Delete />
      </IconButton>
    </Grid>
  );
};

export default PluginContainer;
