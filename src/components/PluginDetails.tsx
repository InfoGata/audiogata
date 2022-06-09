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
import { FileType } from "../types";
import { getPlugin } from "../utils";
import { usePlugins } from "../PluginsContext";

const PluginDetails: React.FC = () => {
  const { id } = useParams<"id">();
  const [plugin, setPlugin] = React.useState<PluginInfo>();
  const [scriptSize, setScriptSize] = React.useState(0);
  const [optionSize, setOptionsSize] = React.useState(0);
  const { updatePlugin } = usePlugins();

  const loadPluginFromDb = React.useCallback(async () => {
    const p = await db.plugins.get(id || "");
    setPlugin(p);
    const scriptBlob = new Blob([p?.script || ""]);
    setScriptSize(scriptBlob.size);
    if (p?.optionsHtml) {
      const optionsBlob = new Blob([p?.optionsHtml]);
      setOptionsSize(optionsBlob.size);
    }
  }, [id]);

  React.useEffect(() => {
    loadPluginFromDb();
  }, [loadPluginFromDb]);

  const onUpdate = async () => {
    if (plugin?.updateUrl) {
      const headers = new Headers();
      if (process.env.REACT_APP_GITLAB_ACCESS_TOKEN) {
        headers.append(
          "PRIVATE-TOKEN",
          process.env.REACT_APP_GITLAB_ACCESS_TOKEN
        );
      }
      const fileType: FileType = {
        url: {
          url: plugin.updateUrl,
          headers: headers,
        },
      };
      const newPlugin = await getPlugin(fileType);
      if (newPlugin && plugin.id) {
        newPlugin.id = plugin.id;
        newPlugin.updateUrl = plugin.updateUrl;
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
              <ListItemText primary="Update Url" secondary={plugin.updateUrl} />
            </ListItem>
          </List>
          {plugin.updateUrl && <Button onClick={onUpdate}>Update</Button>}
        </div>
      ) : (
        <>Not Found</>
      )}
    </>
  );
};

export default PluginDetails;
