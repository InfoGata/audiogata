import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useSnackbar } from "notistack";
import React from "react";
import { useTranslation } from "react-i18next";
import { Playlist, Track } from "../plugintypes";
import { useAppDispatch } from "../store/hooks";
import { addPlaylist } from "../store/reducers/playlistReducer";

interface AddPlaylistDialogProps {
  open: boolean;
  tracks?: Track[];
  handleClose: () => void;
}

const AddPlaylistDialog: React.FC<AddPlaylistDialogProps> = (props) => {
  const { open, handleClose } = props;
  const { t } = useTranslation();
  const [name, setName] = React.useState("");
  const formId = React.useId();
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tracks = props.tracks || [];
    const playlist: Playlist = {
      name,
      tracks: tracks,
    };
    dispatch(addPlaylist(playlist));
    enqueueSnackbar(t("playlistCreated"));

    handleClose();
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">{t("addPlaylist")}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t("givePlaylistName")}</DialogContentText>
        <form id={formId} onSubmit={onSubmit}>
          <TextField
            autoFocus={true}
            margin="dense"
            id="name"
            label={t("playlistName")}
            type="text"
            fullWidth={true}
            value={name}
            onChange={onChange}
          />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t("cancel")}</Button>
        <Button type="submit" form={formId}>
          {t("addPlaylist")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(AddPlaylistDialog);
