import React from "react";
import {
  Button,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { db } from "../database";
import { PluginInfo } from "../plugintypes";
import { getFileTypeFromPluginUrl, getPlugin } from "../utils";
import { usePlugins } from "../PluginsContext";

const PluginDetails: React.FC = () => {
  const { pluginId } = useParams<"pluginId">();
  const [plugin, setPlugin] = React.useState<PluginInfo>();
  const [scriptSize, setScriptSize] = React.useState(0);
  const [optionSize, setOptionsSize] = React.useState(0);
  const { updatePlugin } = usePlugins();

  const loadPluginFromDb = React.useCallback(async () => {
    const p = await db.plugins.get(pluginId || "");
    setPlugin(p);
    const scriptBlob = new Blob([p?.script || ""]);
    setScriptSize(scriptBlob.size);
    if (p?.optionsHtml) {
      const optionsBlob = new Blob([p.optionsHtml]);
      setOptionsSize(optionsBlob.size);
    }
  }, [pluginId]);

  React.useEffect(() => {
    loadPluginFromDb();
  }, [loadPluginFromDb]);

  const onUpdate = async () => {
    if (plugin?.manifestUrl) {
      const fileType = getFileTypeFromPluginUrl(plugin.manifestUrl);
      const newPlugin = await getPlugin(fileType);
      if (newPlugin && plugin.id) {
        newPlugin.id = plugin.id;
        newPlugin.manifestUrl = plugin.manifestUrl;
        await updatePlugin(newPlugin, plugin.id);
        await loadPluginFromDb();
      }
    }
  };

  return (
    <>
      {plugin ? (
        <div>
          <Typography variant="h3">Plugin Details</Typography>
          <Typography variant="h6">{plugin.name}</Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="Description"
                secondary={plugin.description}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="Version" secondary={plugin.version} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Id" secondary={plugin.id} />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Script Size"
                secondary={`${scriptSize / 1000} kb`}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Options Page Size"
                secondary={`${optionSize / 1000} kb`}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Update Url"
                secondary={plugin.manifestUrl}
              />
            </ListItem>
          </List>
          {plugin.manifestUrl && <Button onClick={onUpdate}>Update</Button>}
        </div>
      ) : (
        <>Not Found</>
      )}
    </>
  );
};

export default PluginDetails;
