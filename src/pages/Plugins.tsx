import { Button, Grid, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import React from "react";
import { useTranslation } from "react-i18next";
import usePlugins from "../hooks/usePlugins";
import { PluginInfo } from "../plugintypes";
import { FileType } from "../types";
import { directoryProps, generatePluginId, getPlugin } from "../utils";
import AddPluginUrlDialog from "../components/AddPluginUrlDialog";
import ConfirmPluginDialog from "../components/ConfirmPluginDialog";
import PluginCards from "../components/PluginCards";
import PluginContainer from "../components/PluginContainer";

const FileInput = styled("input")({
  display: "none",
});

const Plugins: React.FC = () => {
  const { plugins, deletePlugin, pluginsFailed, reloadPlugins } = usePlugins();
  const [pendingPlugin, setPendingPlugin] = React.useState<PluginInfo | null>(
    null
  );
  const [isCheckingUpdate, setIsCheckingUpdate] = React.useState(false);
  const [openUrlDialog, setOpenUrlDialog] = React.useState(false);
  const { t } = useTranslation("plugins");

  const onCloseUrlDialog = () => setOpenUrlDialog(false);
  const onOpenUrlDialog = () => setOpenUrlDialog(true);

  const onConfirmUrlDialog = (plugin: PluginInfo) => {
    onCloseUrlDialog();
    setPendingPlugin(plugin);
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileType: FileType = {
      filelist: files,
    };
    const plugin = await getPlugin(fileType);

    if (plugin) {
      if (!plugin.id) {
        plugin.id = generatePluginId();
      }
      setPendingPlugin(plugin);
    }
  };

  const onConfirmPluginClose = () => {
    setPendingPlugin(null);
  };

  const pluginComponents = plugins.map((plugin) => (
    <PluginContainer
      key={plugin.id}
      plugin={plugin}
      deletePlugin={deletePlugin}
      isCheckingUpdate={isCheckingUpdate}
    />
  ));

  const onCheckUpdates = () => {
    setIsCheckingUpdate(true);
  };

  return (
    <Grid sx={{ "& button": { m: 1 } }}>
      <Grid>
        <label htmlFor="contained-button-file">
          <FileInput
            id="contained-button-file"
            type="file"
            {...directoryProps}
            onChange={onFileChange}
          />
          <Button variant="contained" component="span">
            {t("loadPluginFromFolder")}
          </Button>
        </label>
      </Grid>
      <Grid>
        <Button variant="contained" onClick={onOpenUrlDialog}>
          {t("loadPluginFromUrl")}
        </Button>
      </Grid>
      {plugins.length > 0 && (
        <Grid>
          <Button disabled={isCheckingUpdate} onClick={onCheckUpdates}>
            {t("checkForUpdates")}
          </Button>
        </Grid>
      )}
      {pluginsFailed && (
        <Grid>
          <Button
            variant="contained"
            color="warning"
            onClick={reloadPlugins}
          >{`${t("failedPlugins")}: ${t("clickReload")}`}</Button>
        </Grid>
      )}
      {plugins.length > 0 && (
        <Typography variant="h6">{t("installedPlugins")}</Typography>
      )}
      <Grid>{pluginComponents}</Grid>
      <ConfirmPluginDialog
        open={Boolean(pendingPlugin)}
        plugins={pendingPlugin ? [pendingPlugin] : []}
        handleClose={onConfirmPluginClose}
      />
      <AddPluginUrlDialog
        open={openUrlDialog}
        handleConfirm={onConfirmUrlDialog}
        handleClose={onCloseUrlDialog}
      />
      <PluginCards />
    </Grid>
  );
};

export default Plugins;
