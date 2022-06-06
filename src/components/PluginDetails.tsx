import React from "react";
import { List, ListItem, ListItemText, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import { db } from "../database";
import { PluginInfo } from "../plugintypes";

const PluginDetails: React.FC = () => {
  const { id } = useParams<"id">();
  const [plugin, setPlugin] = React.useState<PluginInfo>();
  const [scriptSize, setScriptSize] = React.useState(0);
  const [optionSize, setOptionsSize] = React.useState(0);

  React.useEffect(() => {
    const getPlugin = async () => {
      const p = await db.plugins.get(id || "");
      setPlugin(p);
      const scriptBlob = new Blob([p?.script || ""]);
      setScriptSize(scriptBlob.size);
      if (p?.optionsHtml) {
        const optionsBlob = new Blob([p?.optionsHtml]);
        setOptionsSize(optionsBlob.size);
      }
    };
    getPlugin();
  }, [id]);

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
          </List>
        </div>
      ) : (
        <>Not Found</>
      )}
    </>
  );
};

export default PluginDetails;