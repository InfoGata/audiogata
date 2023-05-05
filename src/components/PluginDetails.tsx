import React from "react";
import {
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { db } from "../database";
import { PluginInfo } from "../plugintypes";
import { getFileTypeFromPluginUrl, getPlugin } from "../utils";
import usePlugins from "../hooks/usePlugins";
import { useTranslation } from "react-i18next";

const PluginDetails: React.FC = () => {
  const { pluginId } = useParams<"pluginId">();
  const [plugin, setPlugin] = React.useState<PluginInfo>();
  const [scriptSize, setScriptSize] = React.useState(0);
  const [optionSize, setOptionsSize] = React.useState(0);
  const { updatePlugin } = usePlugins();
  const { t } = useTranslation(["plugins", "common"]);

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
          <Typography variant="h3">
            {t("plugins:pluginDetailsTitle")}
          </Typography>
          <Typography variant="h6">{plugin.name}</Typography>
          <List>
            <ListItem>
              <ListItemText
                primary={t("plugins:pluginDescription")}
                secondary={plugin.description}
              />
            </ListItem>
            {plugin.homepage && (
              <ListItem disablePadding>
                <ListItemButton
                  component="a"
                  href={plugin.homepage}
                  target="_blank"
                >
                  <ListItemText
                    primary={t("plugins:homepage")}
                    secondary={plugin.homepage}
                  />
                </ListItemButton>
              </ListItem>
            )}
            <ListItem>
              <ListItemText
                primary={t("plugins:version")}
                secondary={plugin.version}
              />
            </ListItem>
            <ListItem>
              <ListItemText primary="Id" secondary={plugin.id} />
            </ListItem>
            <ListItem>
              <ListItemText
                primary={t("plugins:scriptSize")}
                secondary={`${scriptSize / 1000} kb`}
              />
            </ListItem>
            {!!optionSize && (
              <ListItem>
                <ListItemText
                  primary={t("plugins:optionsPageSize")}
                  secondary={`${optionSize / 1000} kb`}
                />
              </ListItem>
            )}
            {plugin.manifestUrl && (
              <ListItem disablePadding>
                <ListItemButton
                  component="a"
                  href={plugin.manifestUrl}
                  target="_blank"
                >
                  <ListItemText
                    primary={t("plugins:updateUrl")}
                    secondary={plugin.manifestUrl}
                  />
                </ListItemButton>
              </ListItem>
            )}
          </List>
          {plugin.manifestUrl && (
            <Button onClick={onUpdate}>{t("plugins:updatePlugin")}</Button>
          )}
        </div>
      ) : (
        <>{t("common:notFound")}</>
      )}
    </>
  );
};

export default PluginDetails;
