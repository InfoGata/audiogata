import AboutLink, { AboutLinkProps } from "@/components/AboutLink";
import Spinner from "@/components/Spinner";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLiveQuery } from "dexie-react-hooks";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { db } from "../database";
import usePlugins from "../hooks/usePlugins";
import { Manifest } from "../plugintypes";
import { FileType } from "../types";
import {
  directoryProps,
  getFileText,
  getFileTypeFromPluginUrl,
  getPlugin,
} from "../utils";

const PluginDetails: React.FC = () => {
  const { pluginId } = useParams<"pluginId">();
  const { updatePlugin, plugins } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginId);
  const { t } = useTranslation(["plugins", "common"]);
  const [hasUpdate, setHasUpdate] = React.useState(false);
  const [isCheckingUpdate, setIsCheckingUpdate] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const updatePluginFromFilelist = async (files: FileList) => {
    const fileType: FileType = {
      filelist: files,
    };
    const newPlugin = await getPlugin(fileType);

    if (newPlugin && plugin && plugin.id) {
      newPlugin.id = plugin.id;
      await updatePlugin(newPlugin, plugin.id, files);
    }
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setLoading(true);
    await updatePluginFromFilelist(files);
    setLoading(false);
  };

  const onReload = async () => {
    if (!plugin) return;

    const files = plugin.fileList;
    if (!files) return;

    setLoading(true);
    await updatePluginFromFilelist(files);
    setLoading(false);
  };

  const pluginInfo = useLiveQuery(() => db.plugins.get(pluginId || ""));
  const scriptSize = React.useMemo(() => {
    const scriptBlob = new Blob([pluginInfo?.script || ""]);
    return scriptBlob.size;
  }, [pluginInfo]);
  const optionSize = React.useMemo(() => {
    return pluginInfo?.optionsHtml
      ? new Blob([pluginInfo?.optionsHtml || ""]).size
      : 0;
  }, [pluginInfo]);

  const onUpdate = async () => {
    if (pluginInfo?.manifestUrl) {
      const fileType = getFileTypeFromPluginUrl(pluginInfo.manifestUrl);
      const newPlugin = await getPlugin(fileType);
      if (newPlugin && pluginInfo.id) {
        newPlugin.id = pluginInfo.id;
        newPlugin.manifestUrl = pluginInfo.manifestUrl;
        await updatePlugin(newPlugin, pluginInfo.id);
      }
    }
  };

  const checkUpdate = async () => {
    if (!isCheckingUpdate && pluginInfo?.manifestUrl) {
      setIsCheckingUpdate(true);
      const fileType = getFileTypeFromPluginUrl(pluginInfo.manifestUrl);
      const manifestText = await getFileText(fileType, "manifest.json");
      if (manifestText) {
        const manifest = JSON.parse(manifestText) as Manifest;
        if (manifest.version !== pluginInfo.version) {
          setHasUpdate(true);
          toast(t("plugins:updateFound"));
        } else {
          setHasUpdate(false);
          toast(t("plugins:noUpdateFound"));
        }
      }
    }
    setIsCheckingUpdate(false);
  };

  if (!pluginInfo) {
    return <div>{t("common:notFound")}</div>;
  }

  const aboutLinks: (AboutLinkProps | null)[] = [
    {
      title: t("plugins:pluginDescription"),
      description: pluginInfo.description,
    },
    pluginInfo.homepage
      ? {
          title: t("plugins:homepage"),
          description: pluginInfo.homepage,
          url: pluginInfo.homepage,
        }
      : null,
    { title: t("plugins:version"), description: pluginInfo.version },
    { title: "Id", description: pluginInfo.id },
    { title: t("plugins:scriptSize"), description: `${scriptSize / 1000} kb` },
    {
      title: t("plugins:optionsPageSize"),
      description: `${optionSize / 1000} kb`,
    },
    pluginInfo.manifestUrl
      ? {
          title: t("plugins:updateUrl"),
          description: pluginInfo.manifestUrl,
          url: pluginInfo.manifestUrl,
        }
      : null,
  ];

  return (
    <>
      <Spinner open={loading} />
      <div>
        <h1 className="text-3xl font-bold">
          {t("plugins:pluginDetailsTitle")}
        </h1>
        <h2 className="text-2xl font-semibold">{pluginInfo.name}</h2>
        <div className="flex gap-2 flex-wrap">
          {pluginInfo.optionsHtml && (
            <Link
              className={cn(buttonVariants({ variant: "outline" }))}
              to={`/plugins/${pluginInfo.id}/options`}
            >
              {t("plugins:options")}
            </Link>
          )}
          {pluginInfo.manifestUrl && (
            <Button variant="outline" onClick={checkUpdate}>
              {t("plugins:checkForUpdates")}
            </Button>
          )}
          {hasUpdate && (
            <Button variant="outline" onClick={onUpdate}>
              {t("plugins:updatePlugin")}
            </Button>
          )}

          <label
            htmlFor={`update-plugin-${pluginInfo.id}`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "cursor-pointer"
            )}
          >
            <input
              id={`update-plugin-${pluginInfo.id}`}
              type="file"
              {...directoryProps}
              onChange={onFileChange}
              className="hidden"
            />
            {t("plugins:updateFromFile")}
          </label>

          {plugin?.fileList && (
            <Button className="cursor-pointer" onClick={onReload}>
              <span>{t("plugins:reloadPlugin")}</span>
            </Button>
          )}
        </div>
        {aboutLinks.map((a) => a && <AboutLink {...a} key={a.title} />)}
      </div>
    </>
  );
};

export default PluginDetails;
