import { Capacitor } from "@capacitor/core";
import React from "react";
import { useParams } from "react-router-dom";
import { usePlugins } from "../PluginsContext";
import { db } from "../database";
import { Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { getPluginSubdomain } from "../utils";

const PluginOptions: React.FC = () => {
  const { pluginId } = useParams<"pluginId">();
  const { plugins, pluginMessage } = usePlugins();
  const ref = React.useRef<HTMLIFrameElement>(null);
  const plugin = plugins.find((p) => p.id === pluginId);
  const [optionsHtml, setOptionsHtml] = React.useState<string>();
  const { t } = useTranslation(["plugins", "common"]);

  const iframeListener = React.useCallback(
    async (event: MessageEvent<any>) => {
      if (ref.current?.contentWindow === event.source && plugin) {
        if (await plugin.hasDefined.onUiMessage()) {
          plugin.remote.onUiMessage(event.data);
        }
      }
    },
    [plugin]
  );

  React.useEffect(() => {
    window.addEventListener("message", iframeListener);
    return () => window.removeEventListener("message", iframeListener);
  }, [iframeListener]);

  React.useEffect(() => {
    if (pluginMessage?.pluginId === plugin?.id) {
      ref.current?.contentWindow?.postMessage(pluginMessage?.message, "*");
    }
  }, [pluginMessage, plugin?.id]);

  React.useEffect(() => {
    const getOptionsHtml = async () => {
      if (plugin) {
        if (!plugin.optionsSameOrigin) {
          const pluginData = await db.plugins.get(plugin.id || "");
          setOptionsHtml(pluginData?.optionsHtml);
        }
      }
    };

    getOptionsHtml();
  }, [plugin]);

  if (!plugin) return <>{t("common:notFound")}</>;

  const srcUrl = `${getPluginSubdomain(plugin.id)}/ui.html`;
  let sandbox = "allow-scripts allow-popups allow-popups-to-escape-sandbox";
  if (plugin.optionsSameOrigin) sandbox = sandbox.concat(" allow-same-origin");
  // window.open needs allow-top-navigation-by-user-activiation
  if (Capacitor.isNativePlatform())
    sandbox = sandbox.concat(" allow-top-navigation-by-user-activation");

  const iframeOnload = async () => {
    const pluginData = await db.plugins.get(plugin.id || "");
    if (pluginData) {
      ref.current?.contentWindow?.postMessage(
        {
          type: "init",
          srcdoc: pluginData?.optionsHtml,
        },
        "*"
      );
    }
  };

  const pluginIframe = plugin.optionsSameOrigin ? (
    <iframe
      ref={ref}
      name={plugin.id}
      title={plugin.name}
      sandbox={sandbox}
      src={srcUrl}
      onLoad={iframeOnload}
      width="100%"
      frameBorder="0"
      style={{ height: "80vh" }}
    />
  ) : (
    <iframe
      ref={ref}
      name={plugin.id}
      title={plugin.name}
      sandbox={sandbox}
      srcDoc={optionsHtml}
      width="100%"
      frameBorder="0"
      style={{ height: "80vh" }}
    />
  );

  return (
    <Grid>
      <Typography variant="h3">
        {t("plugins:pluginOptions", { pluginName: plugin.name })}
      </Typography>
      {optionsHtml && pluginIframe}
    </Grid>
  );
};

export default PluginOptions;
