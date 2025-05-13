import React from "react";
import { useTranslation } from "react-i18next";
import { PluginFrameContainer } from "../PluginsContext";
import usePlugins from "../hooks/usePlugins";
import { ParseUrlType, Playlist, Track } from "../plugintypes";
import { filterAsync } from "@infogata/utils";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { toast } from "sonner";

interface ImportDialogProps {
  open: boolean;
  title?: string;
  parseType: ParseUrlType;
  onSuccess: (item: Track[] | Playlist) => void;
  setOpen: (open: boolean) => void;
}

const parseTypeToMethod = async (
  plugin: PluginFrameContainer,
  parseType: ParseUrlType
): Promise<boolean> => {
  switch (parseType) {
    case "playlist":
      return await plugin.hasDefined.onLookupPlaylistUrl();
    case "track":
      return await plugin.hasDefined.onLookupTrackUrls();
  }
};

const lookupUrl = async (
  plugin: PluginFrameContainer,
  parseType: ParseUrlType,
  url: string
) => {
  switch (parseType) {
    case "playlist":
      return await plugin.remote.onLookupPlaylistUrl(url);
    case "track":
      return await plugin.remote.onLookupTrackUrls([url]);
  }
};

const ImportDialog: React.FC<ImportDialogProps> = (props) => {
  const { open, parseType, onSuccess, title, setOpen } = props;
  const { plugins } = usePlugins();
  const [url, setUrl] = React.useState("");
  const formId = React.useId();

  const [parserPlugins, setParserPlugins] = React.useState<
    PluginFrameContainer[]
  >([]);
  const { t } = useTranslation();

  React.useEffect(() => {
    const getParsers = async () => {
      const parserPlugins = await filterAsync(plugins, (p) =>
        p.hasDefined.onCanParseUrl()
      );
      const validPlugins = await filterAsync(parserPlugins, (p) =>
        parseTypeToMethod(p, parseType)
      );
      setParserPlugins(validPlugins);
    };
    getParsers();
  }, [plugins, parseType]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsers = await filterAsync(parserPlugins, (p) =>
      p.remote.onCanParseUrl(url, parseType)
    );
    const parser = parsers[0];
    if (parser) {
      const item = await lookupUrl(parser, parseType, url);
      onSuccess(item);
    } else {
      toast.error(t("noImporters"));
    }
    setUrl("");
    setOpen(false);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title ? title : t("import")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <form id={formId} onSubmit={onSubmit}>
            <Input
              autoFocus={true}
              type="text"
              value={url}
              onChange={onChange}
            />
          </form>
          <h3 className="font-bold">{t("plugins")}:</h3>
          {parserPlugins.length > 0 ? (
            <ul>
              {parserPlugins.map((p) => (
                <li key={p.id}>{p.name}</li>
              ))}
            </ul>
          ) : (
            <h4>{t("noImporters")}</h4>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("cancel")}
          </Button>
          <Button variant="outline" type="submit" form={formId}>
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportDialog;
