import AboutLink, { AboutLinkProps } from "@/components/AboutLink";
import Spinner from "@/components/Spinner";
import Title from "@/components/Title";
import { Button, buttonVariants } from "@/components/ui/button";
import { db } from "@/database";
import usePlugins from "@/hooks/usePlugins";
import { cn } from "@/lib/utils";
import { Manifest } from "@/plugintypes";
import { FileType, NotifyLoginMessage } from "@/types";
import {
  directoryProps,
  getFileText,
  getFileTypeFromPluginUrl,
  getPlugin,
  hasAuthentication,
  hasExtension,
} from "@/utils";
import { InAppBrowser } from "@awesome-cordova-plugins/in-app-browser";
import { Capacitor } from "@capacitor/core";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";
import isElectron from "is-electron";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const PluginDetails: React.FC = () => {
  const { pluginId } = Route.useParams();
  const { updatePlugin, plugins } = usePlugins();
  const plugin = plugins.find((p) => p.id === pluginId);
  const { t } = useTranslation(["plugins", "common"]);
  const pluginAuth = useLiveQuery(() => db.pluginAuths.get(pluginId || ""));
  const [hasAuth, setHasAuth] = React.useState(false);
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

  React.useEffect(() => {
    const getHasAuth = async () => {
      const platformHasAuth = await hasAuthentication();
      console.log(platformHasAuth);
      setHasAuth(platformHasAuth && !!pluginInfo?.manifest?.authentication);
    };
    getHasAuth();
  }, [pluginInfo]);

  const iframeListener = React.useCallback(
    async (event: MessageEvent<NotifyLoginMessage>) => {
      if (event.source !== window) {
        return;
      }

      console.log("Test iframe listener", event.data);
      if (event.data.type === "infogata-extension-notify-login") {
        if (plugin && event.data.pluginId === plugin.id) {
          db.pluginAuths.put({
            pluginId: plugin.id || "",
            headers: event.data.headers,
            domainHeaders: event.data.domainHeaders,
          });
          if (await plugin?.hasDefined.onPostLogin()) {
            await plugin.remote.onPostLogin();
          }
        }
      }
    },
    [plugin]
  );

  React.useEffect(() => {
    window.addEventListener("message", iframeListener);
    return () => window.removeEventListener("message", iframeListener);
  }, [iframeListener]);


  const onLogin = () => {
    if (pluginInfo?.manifest?.authentication?.loginUrl) {
      if (hasExtension() && window.InfoGata?.openLoginWindow) {
        window.InfoGata.openLoginWindow(
          pluginInfo.manifest.authentication,
          pluginInfo.id || ""
        );
      } else if (Capacitor.isNativePlatform()) {
        InAppBrowser.create(pluginInfo.manifest.authentication?.loginUrl, "_blank");
      } else if (isElectron()) {
        console.log(window.api);
        console.log(window.electron)
        window.api.openLoginWindow(
          pluginInfo.manifest.authentication,
          pluginInfo.id || ""
        );
      }
    }
  };

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


  const onLogout = async () => {
    if (pluginId) {
      db.pluginAuths.delete(pluginId);
      if (plugin && (await plugin.hasDefined.onPostLogout())) {
        await plugin.remote.onPostLogout();
      }
    }
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
        <Title title={t("plugins:pluginDetailsTitle")} />
        <h2 className="text-2xl font-semibold">{pluginInfo.name}</h2>
        <div className="flex gap-2 flex-wrap">
          {pluginInfo.optionsHtml && (
            <Link
              className={cn(buttonVariants({ variant: "outline" }))}
              to="/plugins/$pluginId/options"
              params={{ pluginId: pluginInfo.id || "" }}
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
          {hasAuth && pluginAuth && (
            <Button variant="outline" onClick={onLogout}>
              {t("plugins:logout")}
            </Button>
          )}
          {hasAuth && !pluginAuth && (
            <Button variant="outline" onClick={onLogin}>
              {t("plugins:login")}
            </Button>
          )}
        </div>
        {aboutLinks.map((a) => a && <AboutLink {...a} key={a.title} />)}
      </div>
    </>
  );
};

export const Route = createFileRoute("/plugins/$pluginId/")({
  component: PluginDetails,
});
