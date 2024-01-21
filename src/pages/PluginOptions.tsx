import { Capacitor } from "@capacitor/core";
import { Grid, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { db } from "../database";
import usePlugins from "../hooks/usePlugins";
import { getPluginSubdomain } from "../utils";
import Spinner from "../components/Spinner";

const PluginOptions: React.FC = () => {
  const { pluginId } = useParams<"pluginId">();
  const { plugins, pluginMessage, pluginsLoaded } = usePlugins();
  const ref = React.useRef<HTMLIFrameElement>(null);
  const plugin = plugins.find((p) => p.id === pluginId);
  const [optionsHtml, setOptionsHtml] = React.useState<string>();
  const { t } = useTranslation(["plugins", "common"]);

  React.useEffect(() => {
    const getOptionsHtml = async () => {
      const pluginData = await db.plugins.get(plugin?.id || "");
      setOptionsHtml(pluginData?.optionsHtml);
    };

    getOptionsHtml();
  }, [plugin]);

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

  const iframeOnload = async () => {
    const pluginData = await db.plugins.get(plugin?.id || "");
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

  if (!pluginsLoaded) {
    return <Spinner />;
  }
  if (!plugin) return <>{t("common:notFound")}</>;

  let sandbox =
    "allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin";
  // window.open needs allow-top-navigation-by-user-activiation
  if (Capacitor.isNativePlatform())
    sandbox = sandbox.concat(" allow-top-navigation-by-user-activation");
  const srcUrl = `${getPluginSubdomain(plugin.id)}/ui.html`;
  return (
    <Grid>
      <Typography variant="h3">
        {t("plugins:pluginOptions", { pluginName: plugin.name })}
      </Typography>
      {optionsHtml && (
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
      )}
    </Grid>
  );
};

export default PluginOptions;
