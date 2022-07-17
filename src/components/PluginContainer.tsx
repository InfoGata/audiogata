import { Button, Grid, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";
import { PluginFrameContainer, usePlugins } from "../PluginsContext";
import {
  directoryProps,
  getFileText,
  getFileTypeFromPluginUrl,
  getPlugin,
} from "../utils";
import { FileType, Manifest } from "../types";
import { Link } from "react-router-dom";

const FileInput = styled("input")({
  display: "none",
});

interface PluginContainerProps {
  plugin: PluginFrameContainer;
  deletePlugin: (plugin: PluginFrameContainer) => Promise<void>;
  isCheckingUpdate: boolean;
}

const PluginContainer: React.FC<PluginContainerProps> = (props) => {
  const { plugin, deletePlugin, isCheckingUpdate } = props;
  const { updatePlugin } = usePlugins();
  const [hasUpdate, setHasUpdate] = React.useState(false);

  React.useEffect(() => {
    const checkUpdate = async () => {
      if (isCheckingUpdate && plugin.manifestUrl) {
        const fileType = getFileTypeFromPluginUrl(plugin.manifestUrl);
        const manifestText = await getFileText(fileType, "manifest.json");
        if (manifestText) {
          const manifest = JSON.parse(manifestText) as Manifest;
          if (manifest.version !== plugin.version) {
            setHasUpdate(true);
          } else {
            setHasUpdate(false);
          }
        }
      }
    };
    checkUpdate();
  }, [isCheckingUpdate, plugin]);

  const onDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this plugin"
    );
    if (confirmDelete) {
      await deletePlugin(plugin);
    }
  };

  const updatePluginFromFilelist = async (files: FileList) => {
    const fileType: FileType = {
      filelist: files,
    };
    const newPlugin = await getPlugin(fileType);

    if (newPlugin && plugin.id) {
      newPlugin.id = plugin.id;
      await updatePlugin(newPlugin, plugin.id, files);
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    await updatePluginFromFilelist(files);
  };

  const onReload = async () => {
    const files = plugin.fileList;
    if (!files) return;

    await updatePluginFromFilelist(files);
  };

  const onUpdate = async () => {
    if (plugin?.manifestUrl) {
      const fileType = getFileTypeFromPluginUrl(plugin.manifestUrl);
      const newPlugin = await getPlugin(fileType);

      if (newPlugin && plugin.id) {
        newPlugin.id = plugin.id;
        newPlugin.manifestUrl = plugin.manifestUrl;
        await updatePlugin(newPlugin, plugin.id);
      }
    }
  };

  return (
    <Grid key={plugin.id}>
      <Typography>
        {plugin.name} {plugin.version}
      </Typography>
      {plugin.hasOptions && (
        <Button component={Link} to={`/plugins/${plugin.id}/options`}>
          Options
        </Button>
      )}
      <Button onClick={onDelete}>Delete</Button>
      <label htmlFor={`update-plugin-${plugin.id}`}>
        <FileInput
          id={`update-plugin-${plugin.id}`}
          type="file"
          {...directoryProps}
          onChange={onFileChange}
        />
        <Button component="span">Update From File</Button>
      </label>
      <Button component={Link} to={`/plugins/${plugin.id}`}>
        Details
      </Button>
      {plugin.fileList && <Button onClick={onReload}>Reload</Button>}
      {hasUpdate && <Button onClick={onUpdate}>Update</Button>}
    </Grid>
  );
};

export default PluginContainer;
