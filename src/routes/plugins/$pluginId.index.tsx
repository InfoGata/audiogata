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
      setHasAuth(platformHasAuth && !!pluginInfo?.manifest?.authentication);
    };
    getHasAuth();
  }, [pluginInfo]);

  const iframeListener = React.useCallback(
    async (event: MessageEvent<NotifyLoginMessage>) => {
      if (event.source !== window) {
        return;
      }

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
        const browser = InAppBrowser.create(pluginInfo.manifest.authentication?.loginUrl, "_blank");
        const auth = pluginInfo.manifest.authentication;

        const loginInfo = {
          foundCompletionUrl: !pluginInfo.manifest.authentication?.completionUrl,
          foundHeaders: !pluginInfo.manifest.authentication?.headersToFind,
          foundDomainHeaders: !pluginInfo.manifest.authentication?.domainHeadersToFind,
          foundCookies: !pluginInfo.manifest.authentication?.cookiesToFind,
          headers: {} as Record<string, string>,
          domainHeaders: {} as Record<string, Record<string, string>>
        }

        browser.on("message").subscribe(async (event) => {
          const data = event.data;
          const type: string = data.type;
          const url: string = data.url;
          const headers: Record<string, string> = data.headers;
          const headerMap = new Map(Object.entries(headers));
          const detailsUrl = new URL(url);
          const urlHost = detailsUrl.host;
          if (type === "intercept") {
            if (auth.completionUrl && !loginInfo.foundCompletionUrl) {
              loginInfo.foundCompletionUrl = true;
            } else if (auth.completionUrl?.endsWith("?")) {
              const urlToCheck = auth.completionUrl.slice(0, -2);
              const originAndPath = `${detailsUrl.origin}${detailsUrl.pathname}`;
              loginInfo.foundCompletionUrl = urlToCheck === originAndPath;
            }
          }

          if (auth.cookiesToFind && !loginInfo.foundCookies) {
            const cookies = headerMap.get("Cookie");
            if (cookies) {
              const cookieMap = new Map(
                cookies
                  .split(";")
                  .map((cookie) => cookie.trim().split("="))
                  .map((cookie) => [cookie[0], cookie[1]])
              );

              loginInfo.foundCookies = auth.cookiesToFind.every((cookie) =>
                cookieMap.has(cookie)
              );
            }
          }

          if (auth.domainHeadersToFind && !loginInfo.foundDomainHeaders) {
            const domainToSearch = Object.keys(auth.domainHeadersToFind).find(
              (d) => urlHost.endsWith(d)
            );

            if (domainToSearch && !loginInfo.domainHeaders[domainToSearch]) {
              const domainHeaders = auth.domainHeadersToFind[domainToSearch];
              const foundDomainHeaders = domainHeaders.every((dh) =>
                headerMap.has(dh)
              );
              if (foundDomainHeaders) {
                loginInfo.domainHeaders[domainToSearch] = {};
                for (const header of domainHeaders) {
                  const headerValue = headerMap.get(header);
                  if (headerValue) {
                    loginInfo.domainHeaders[domainToSearch][header] =
                      headerValue;
                  }
                }
              }
            }

            if (
              Object.keys(loginInfo.domainHeaders).length ===
              Object.keys(auth.domainHeadersToFind).length
            ) {
              loginInfo.foundDomainHeaders = true;
            }
          }

          if (auth.headersToFind && !loginInfo.foundHeaders) {
            loginInfo.foundHeaders = auth.headersToFind.every((header) =>
              headerMap.has(header)
            );
            if (loginInfo.foundHeaders) {
              for (const header of auth.headersToFind) {
                const headerValue = headerMap.get(header);
                if (headerValue) {
                  loginInfo.headers[header] = headerValue;
                }
              }
            }
          }

          if (loginInfo.foundCompletionUrl && loginInfo.foundHeaders && loginInfo.foundDomainHeaders && loginInfo.foundCookies) {
            db.pluginAuths.put({
              pluginId: pluginInfo.id || "",
              headers: loginInfo.headers,
              domainHeaders: loginInfo.domainHeaders,
            });
            if (plugin && await plugin.hasDefined.onPostLogin()) {
              await plugin.remote.onPostLogin();
            }
            browser.close();
          }
        });
      } else if (isElectron()) {
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
