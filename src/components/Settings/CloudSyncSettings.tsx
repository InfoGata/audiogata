import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { PluginFrameContainer } from "@/contexts/PluginsContext";
import { usePluginLogin } from "@/hooks/usePluginLogin";
import usePlugins from "@/hooks/usePlugins";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  defaultCloudSync,
  updateCloudSync,
} from "@/store/reducers/settingsReducer";
import { cloudSyncManager } from "@/sync/LibraryContext";
import { useCloudSyncState } from "@/sync/useLibrary";
import { filterAsync } from "@infogata/utils";
import { Link } from "@tanstack/react-router";
import React from "react";
import { useTranslation } from "react-i18next";

const NONE = "none";
const INTERVALS = [30, 60, 300, 900];

const CloudSyncSettings: React.FC = () => {
  const { t } = useTranslation("settings");
  const dispatch = useAppDispatch();
  const cloudSync = useAppSelector(
    (state) => state.settings.cloudSync ?? defaultCloudSync,
  );
  const { plugins } = usePlugins();
  const [providers, setProviders] = React.useState<PluginFrameContainer[]>();

  React.useEffect(() => {
    filterAsync(
      plugins,
      async (p) =>
        (await p.hasDefined.onSyncUpload()) &&
        (await p.hasDefined.onSyncDownload()),
    ).then(setProviders);
  }, [plugins]);

  const provider = providers?.find((p) => p.id === cloudSync.pluginId);
  const { hasLogin, isLoggedIn, isLoggingIn, login, logout } =
    usePluginLogin(provider);
  const syncState = useCloudSyncState();

  const onLogin = async () => {
    await login();
    cloudSyncManager.syncNow();
  };

  const status = (() => {
    switch (syncState.status) {
      case "syncing":
        return t("syncing");
      case "success":
        return t("lastSynced", {
          time: syncState.lastSyncTime?.toLocaleTimeString(),
        });
      case "error":
        return t("syncFailed", { error: syncState.lastError?.message });
      default:
        return t("notSynced");
    }
  })();

  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-semibold">{t("cloudSync")}</h3>
      <p className="text-sm text-muted-foreground">
        {t("cloudSyncDescription")}
      </p>
      {providers && providers.length === 0 ? (
        <p className="text-sm">
          {t("noSyncPlugins")}{" "}
          <Link to="/plugins" className="text-primary hover:underline">
            {t("plugins", { ns: "common" })}
          </Link>
        </p>
      ) : (
        <div className="grid w-full items-center gap-1.5">
          <Label htmlFor="sync-plugin">{t("syncPlugin")}</Label>
          <Select
            value={provider?.id ?? NONE}
            onValueChange={(id) =>
              dispatch(
                updateCloudSync({ pluginId: id === NONE ? undefined : id }),
              )
            }
          >
            <SelectTrigger id="sync-plugin">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>{t("syncOff")}</SelectItem>
              {providers?.map((p) => (
                <SelectItem key={p.id} value={p.id || ""}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {provider && (
        <>
          {hasLogin && (
            <div className="flex items-center gap-2">
              {isLoggedIn ? (
                <Button variant="outline" onClick={logout}>
                  {t("logout", { ns: "plugins" })}
                </Button>
              ) : (
                <>
                  <Button disabled={isLoggingIn} onClick={onLogin}>
                    {t("login", { ns: "plugins" })}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {t("loginToSync")}
                  </span>
                </>
              )}
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-sync"
              checked={cloudSync.autoSync}
              onCheckedChange={(checked) =>
                dispatch(updateCloudSync({ autoSync: checked }))
              }
            />
            <Label htmlFor="auto-sync">{t("autoSync")}</Label>
          </div>
          {cloudSync.autoSync && (
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="sync-interval">{t("syncInterval")}</Label>
              <Select
                value={String(cloudSync.syncIntervalSeconds)}
                onValueChange={(value) =>
                  dispatch(
                    updateCloudSync({ syncIntervalSeconds: Number(value) }),
                  )
                }
              >
                <SelectTrigger id="sync-interval">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERVALS.map((seconds) => (
                    <SelectItem key={seconds} value={String(seconds)}>
                      {seconds < 60
                        ? t("seconds", { count: seconds })
                        : t("minutes", { count: seconds / 60 })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {(!hasLogin || isLoggedIn) && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                disabled={syncState.status === "syncing"}
                onClick={() => cloudSyncManager.syncNow()}
              >
                {t("syncNow")}
              </Button>
              <span className="text-sm text-muted-foreground">{status}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CloudSyncSettings;
