import React from "react";
import { useTranslation } from "react-i18next";
import { PluginDescription, defaultPlugins } from "../../default-plugins";
import usePlugins from "../../hooks/usePlugins";
import {
  generatePluginId,
  getFileTypeFromPluginUrl,
  getPlugin,
  isCorsDisabled,
} from "../../utils";
import Spinner from "../Spinner";
import PluginCard from "./PluginCard";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

const PluginCards: React.FC = () => {
  const { t } = useTranslation();
  const { plugins, addPlugin, pluginsLoaded, preinstallComplete } =
    usePlugins();
  const [backdropOpen, setBackdropOpen] = React.useState(false);
  const navigate = useNavigate();

  const onAddPlugin = async (description: PluginDescription) => {
    setBackdropOpen(true);
    const fileType = getFileTypeFromPluginUrl(description.url);

    const plugin = await getPlugin(fileType);

    if (plugin) {
      if (!plugin.id) {
        plugin.id = generatePluginId();
      }
      await addPlugin(plugin);
      toast(`${t("addPluginSuccess")}: ${plugin.name}`);
      navigate({ to: "/plugins" });
    }
    setBackdropOpen(false);
  };

  const pluginCards = defaultPlugins
    .filter(
      (dp) =>
        !plugins.some((p) => dp.id === p.id) &&
        (preinstallComplete || !dp.preinstall) &&
        (!dp.requiresCorsDisabled || isCorsDisabled())
    )
    .map((dp) => (
      <PluginCard addPlugin={onAddPlugin} plugin={dp} key={dp.id} />
    ));

  return (
    <>
      {pluginCards.length > 0 && (
        <div className="space-y-2">
          <Spinner open={backdropOpen} />
          <h2 className="text-2xl font-bold">{t("availablePlugins")}</h2>
          {pluginsLoaded && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 animate-in fade-in">
              {pluginCards}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default PluginCards;
