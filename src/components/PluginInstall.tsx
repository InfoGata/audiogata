import { Typography } from "@mui/material";
import { nanoid } from "@reduxjs/toolkit";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PluginInfo } from "../plugintypes";
import { FileType } from "../types";
import { getPlugin } from "../utils";
import ConfirmPluginDialog from "./ConfirmPluginDialog";

const PluginInstall: React.FC = () => {
  const [isInstalling, setIsInstalling] = React.useState(true);
  const location = useLocation();
  const [pendingPlugin, setPendingPlugin] = React.useState<PluginInfo | null>(
    null
  );
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const manifestUrl = params.get("manifestUrl") || "";
  const headerKey = params.get("headerKey") || "";
  const headerValue = params.get("headerValue") || "";

  React.useEffect(() => {
    const installPlugin = async () => {
      if (!manifestUrl) {
        return;
      }
      if (!manifestUrl.includes("manifest.json")) {
        alert("The filename 'manifest.json' must be in the url");
        setIsInstalling(false);
        return;
      }

      const headers = new Headers();
      if (headerKey && headerValue) {
        headers.append(headerKey, headerValue);
      }

      const fileType: FileType = {
        url: {
          url: manifestUrl,
          headers: headers,
        },
      };

      const plugin = await getPlugin(fileType);
      if (plugin) {
        if (!plugin.id) {
          plugin.id = nanoid();
        }
        setPendingPlugin(plugin);
      }
    };
    installPlugin();
  }, [manifestUrl, headerKey, headerValue]);

  const onConfirmPluginClose = () => {
    setPendingPlugin(null);
  };

  const onAfterConfirm = () => {
    navigate("/plugins");
  };

  const onAfterCancel = () => {
    navigate("/plugins");
  };

  return (
    <>
      {isInstalling ? (
        <Typography variant="h4">
          Installing Plugin from {manifestUrl}
        </Typography>
      ) : (
        <Typography variant="h4">
          Failed to Install plugin from {manifestUrl}
        </Typography>
      )}
      <ConfirmPluginDialog
        open={Boolean(pendingPlugin)}
        plugins={pendingPlugin ? [pendingPlugin] : []}
        handleClose={onConfirmPluginClose}
        afterConfirm={onAfterConfirm}
        afterCancel={onAfterCancel}
      />
    </>
  );
};

export default PluginInstall;
