import AddPluginUrlDialog from "@/components/Plugins/AddPluginUrlDialog";
import PluginContainer from "@/components/Plugins/PluginContainer";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import React from "react";
import { useTranslation } from "react-i18next";
import ConfirmPluginDialog from "../components/ConfirmPluginDialog";
import PluginCards from "../components/PluginCards/PluginCards";
import usePlugins from "../hooks/usePlugins";
import { PluginInfo } from "../plugintypes";
import { FileType } from "../types";
import { directoryProps, generatePluginId, getPlugin } from "../utils";

const Plugins: React.FC = () => {
  const { plugins, deletePlugin, pluginsFailed, reloadPlugins } = usePlugins();
  const { t } = useTranslation("plugins");
  const [pendingPlugin, setPendingPlugin] = React.useState<PluginInfo | null>(
    null
  );
  const [openUrlDialog, setOpenUrlDialog] = React.useState(false);

  const onCloseUrlDialog = () => setOpenUrlDialog(false);
  const onOpenUrlDialog = () => setOpenUrlDialog(true);

  const onConfirmUrlDialog = (plugin: PluginInfo) => {
    onCloseUrlDialog();
    setPendingPlugin(plugin);
  };

  const onConfirmPluginClose = () => {
    setPendingPlugin(null);
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

  const pluginComponents = plugins.map((plugin) => (
    <PluginContainer
      key={plugin.id}
      plugin={plugin}
      deletePlugin={deletePlugin}
    />
  ));

  return (
    <div>
      <div className="grid gap-2 grid-cols-1 md:grid-cols-2 md:w-1/2">
        <label
          htmlFor="contained-button-file"
          className={cn(
            buttonVariants({ variant: "default" }),
            "cursor-pointer"
          )}
        >
          <input
            className="hidden"
            id="contained-button-file"
            type="file"
            {...directoryProps}
            onChange={onFileChange}
          />
          {t("loadPluginFromFolder")}
        </label>
        <Button onClick={onOpenUrlDialog}>{t("loadPluginFromUrl")}</Button>
      </div>
      {pluginsFailed && (
        <Button variant="secondary" onClick={reloadPlugins}>{`${t(
          "failedPlugins"
        )}: ${t("clickReload")}`}</Button>
      )}
      {plugins.length > 0 && (
        <h2 className="text-2xl font-bold">{t("installedPlugins")}</h2>
      )}
      <div className="flex flex-col gap-4">
        <div>{pluginComponents}</div>
        <PluginCards />
      </div>
      <ConfirmPluginDialog
        open={Boolean(pendingPlugin)}
        plugins={pendingPlugin ? [pendingPlugin] : []}
        handleClose={onConfirmPluginClose}
      />
      <AddPluginUrlDialog
        open={openUrlDialog}
        setOpen={setOpenUrlDialog}
        handleConfirm={onConfirmUrlDialog}
      />
    </div>
  );
};

export default Plugins;
