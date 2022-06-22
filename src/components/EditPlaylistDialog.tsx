import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import React from "react";
import { Playlist } from "../plugintypes";
import { useAppDispatch } from "../store/hooks";
import { updatePlaylist } from "../store/reducers/playlistReducer";

interface EditPlaylistDialogProps {
  open: boolean;
  playlist: Playlist;
  handleClose: () => void;
}

const EditPlaylistDialog: React.FC<EditPlaylistDialogProps> = (props) => {
  const { open, playlist, handleClose } = props;
  const [name, setName] = React.useState(playlist.name);
  const dispatch = useAppDispatch();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
  };

  const confirm = () => {
    const editedPlaylist = { ...playlist, name: name };
    dispatch(updatePlaylist(editedPlaylist));
    handleClose();
  };

  return (
    <>
      <form onSubmit={confirm}>
        <Dialog
          open={open}
          onClose={handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Edit Playlist</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus={true}
              margin="dense"
              id="name"
              label="Name"
              type="text"
              value={name}
              fullWidth={true}
              onChange={onChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={confirm}>Update Playlist</Button>
          </DialogActions>
        </Dialog>
      </form>
    </>
  );
};

export default EditPlaylistDialog;
