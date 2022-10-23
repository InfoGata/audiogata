import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { PlaylistInfo } from "../plugintypes";
import { useAppDispatch } from "../store/hooks";
import { updatePlaylist } from "../store/reducers/playlistReducer";

interface EditPlaylistDialogProps {
  open: boolean;
  playlist: PlaylistInfo;
  handleClose: () => void;
}

const EditPlaylistDialog: React.FC<EditPlaylistDialogProps> = (props) => {
  const { open, playlist, handleClose } = props;
  const [name, setName] = React.useState(playlist.name);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const formId = React.useId();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const editedPlaylist = { ...playlist, name: name };
    dispatch(updatePlaylist(editedPlaylist));
    handleClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">{t("editPlaylist")}</DialogTitle>
        <DialogContent>
          <form onSubmit={onSubmit} id={formId}>
            <TextField
              autoFocus={true}
              margin="dense"
              id="name"
              label={t("playlistName")}
              type="text"
              value={name}
              fullWidth={true}
              onChange={onChange}
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>{t("cancel")}</Button>
          <Button type="submit" form={formId}>
            {t("updatePlaylist")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditPlaylistDialog;
