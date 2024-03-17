import React from "react";
import { useTranslation } from "react-i18next";
import { PluginInfo } from "../../plugintypes";
import { FileType } from "../../types";
import { generatePluginId, getPlugin } from "../../utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface AddPluginUrlDialogProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  handleConfirm: (plugin: PluginInfo) => void;
}

const AddPluginUrlDialog: React.FC<AddPluginUrlDialogProps> = (props) => {
  const { open, handleConfirm, setOpen } = props;
  const [pluginUrl, setPluginUrl] = React.useState("");
  const [headerKey, setHeaderKey] = React.useState("");
  const [headerValue, setHeaderValue] = React.useState("");
  const { t } = useTranslation(["plugins", "common"]);

  const onChangePluginUrl = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPluginUrl(event.target.value);
  };
  const onChangeHeaderKey = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHeaderKey(event.target.value);
  };
  const onChangeHeaderValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHeaderValue(event.target.value);
  };

  const onConfirm = async () => {
    if (!pluginUrl.includes("manifest.json")) {
      alert("The filename 'manifest.json' must be in the url");
      return;
    }
    const headers = new Headers();
    if (headerKey) {
      headers.append(headerKey, headerValue);
    }

    const fileType: FileType = {
      url: {
        url: pluginUrl,
        headers: headers,
      },
    };

    const plugin = await getPlugin(fileType);

    if (plugin) {
      if (!plugin.id) {
        plugin.id = generatePluginId();
      }
      handleConfirm(plugin);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle> {t("plugins:addPlugin_one")}</DialogTitle>
          <DialogDescription>
            {t("plugins:installPluginFromUrl")}
          </DialogDescription>
        </DialogHeader>
        <div>
          <Input
            onChange={onChangePluginUrl}
            value={pluginUrl}
            placeholder={t("plugins:manifestUrl")}
          />
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1" className="border-0">
              <AccordionTrigger>
                {t("plugins:advancedOptions")}
              </AccordionTrigger>

              <AccordionContent>
                <div className="flex flex-col gap-2 p-2">
                  <Input
                    onChange={onChangeHeaderKey}
                    value={headerKey}
                    placeholder={t("plugins:headerKey")}
                  />
                  <Input
                    onChange={onChangeHeaderValue}
                    value={headerValue}
                    placeholder={t("plugins:headerValue")}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
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

export default AddPluginUrlDialog;
