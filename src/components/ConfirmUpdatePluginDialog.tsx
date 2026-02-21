import React from "react";
import { useTranslation } from "react-i18next";
import { PluginInfo } from "../plugintypes";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface ConfirmUpdatePluginDialogProps {
  open: boolean;
  plugin: PluginInfo | null;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmUpdatePluginDialog: React.FC<ConfirmUpdatePluginDialogProps> = (
  props
) => {
  const { open, plugin, onConfirm, onClose } = props;
  const { t } = useTranslation(["plugins", "common"]);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("plugins:updatePluginTitle")}</DialogTitle>
          <DialogDescription>
            {t("plugins:confirmUpdatePlugin")}
          </DialogDescription>
        </DialogHeader>
        {plugin && (
          <div>
            {plugin.name} {plugin.version || ""}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common:cancel")}
          </Button>
          <Button variant="outline" onClick={onConfirm}>
            {t("plugins:updatePlugin")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmUpdatePluginDialog;
