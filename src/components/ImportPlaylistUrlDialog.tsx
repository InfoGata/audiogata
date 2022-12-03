import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  TextField,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
import { PluginFrameContainer, usePlugins } from "../PluginsContext";
import { useAppDispatch } from "../store/hooks";
import { addPlaylist } from "../store/reducers/playlistReducer";
import { filterAsync } from "../utils";

interface ImportPlaylistUrlDialogProps {
  open: boolean;
  handleClose: () => void;
}

const ImportPlaylistUrlDialog: React.FC<ImportPlaylistUrlDialogProps> = (
  props
) => {
  const { enqueueSnackbar } = useSnackbar();
  const { plugins } = usePlugins();
  const dispatch = useAppDispatch();
  const { open, handleClose } = props;
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
      const playlistPlugins = await filterAsync(parserPlugins, (p) =>
        p.hasDefined.onLookupPlaylistUrl()
      );
      setParserPlugins(playlistPlugins);
    };
    getParsers();
  }, [plugins]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsers = await filterAsync(parserPlugins, (p) =>
      p.remote.onCanParseUrl(url, "playlist")
    );
    const parser = parsers[0];
    if (parser) {
      const playlist = await parser.remote.onLookupPlaylistUrl(url);
      dispatch(addPlaylist(playlist));
      enqueueSnackbar(t("playlistImported", { playlistName: playlist.name }));
    } else {
      enqueueSnackbar(t("noImporters"), { variant: "error" });
    }
    handleClose();
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">{t("importPlaylist")}</DialogTitle>
      <DialogContent>
        <form id={formId} onSubmit={onSubmit}>
          <TextField
            autoFocus={true}
            margin="dense"
            id="name"
            label="Url"
            type="text"
            fullWidth={true}
            value={url}
            onChange={onChange}
          />
        </form>
        <Typography>{t("plugins")}:</Typography>
        {parserPlugins.length > 0 ? (
          <List>
            {parserPlugins.map((p) => (
              <ListItem key={p.id}>{p.name}</ListItem>
            ))}
          </List>
        ) : (
          <Typography>{t("noImporters")}</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t("cancel")}</Button>
        <Button
          disabled={parserPlugins.length === 0}
          type="submit"
          form={formId}
        >
          {t("importPlaylist")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportPlaylistUrlDialog;
