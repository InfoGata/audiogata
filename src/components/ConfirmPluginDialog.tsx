import React from "react";
import { useTranslation } from "react-i18next";
import usePlugins from "../hooks/usePlugins";
import { PluginInfo } from "../plugintypes";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import AboutLink from "./AboutLink";
import { Checkbox } from "./ui/checkbox";

interface ConfirmPluginDialogProps {
  open: boolean;
  setOpen?: (open: boolean) => void;
  plugins: PluginInfo[];
  handleClose: () => void;
  afterConfirm?: () => void;
  afterCancel?: () => void;
  installUrl?: string;
}

const ConfirmPluginDialog: React.FC<ConfirmPluginDialogProps> = (props) => {
  const {
    open,
    plugins,
    handleClose,
    afterConfirm,
    afterCancel,
    installUrl,
    setOpen,
  } = props;
  const [checked, setChecked] = React.useState<Set<string>>(new Set());
  const { addPlugin } = usePlugins();
  const { t } = useTranslation(["plugins", "common"]);

  React.useEffect(() => {
    setChecked(new Set(plugins.map((p) => p.id || "")));
  }, [plugins]);

  const onConfirm = async () => {
    const savedPlugins = plugins.filter((p) => checked.has(p.id || ""));
    for (const plugin of savedPlugins) {
      if (plugin) {
        await addPlugin(plugin);
      }
    }

    if (afterConfirm) {
      afterConfirm();
    }
    handleClose();
  };

  const onChange = (pluginId: string) => (checked: boolean) => {
    setChecked((prev) => {
      const next = new Set(prev);
      checked ? next.add(pluginId) : next.delete(pluginId);
      return next;
    });
  };

  const info = plugins.map((p) => (
    <div className="flex items-center">
      {plugins.length > 1 && (
        <Checkbox
          className="rounded-none"
          checked={checked.has(p.id || "")}
          onCheckedChange={onChange(p.id || "")}
        />
      )}
      <div className="flex-grow">
        <AboutLink
          title={`${p.name} ${p.version || ""}`}
          description={p.description}
          key={p.id}
        />
      </div>
    </div>
  ));

  const onCancel = () => {
    if (afterCancel) {
      afterCancel();
    }
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t("plugins:addPlugin", { count: plugins.length })}
          </DialogTitle>
        </DialogHeader>
        <div>
          <div>{info}</div>
          {plugins.length === 1 &&
            installUrl &&
            plugins[0].manifestUrl !== installUrl && (
              <div>
                {t("plugins:installManifestUrl")}:{" "}
                <a href={installUrl} target="_blank">
                  {installUrl}
                </a>
              </div>
            )}
          {plugins.length === 1 && plugins[0].manifestUrl && (
            <div>
              {t("plugins:updateManifestUrl")}:{" "}
              <a href={plugins[0].manifestUrl} target="_blank">
                {plugins[0].manifestUrl}
              </a>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            {t("common:cancel")}
          </Button>
          <Button variant="outline" onClick={onConfirm}>
            {t("common:confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmPluginDialog;
