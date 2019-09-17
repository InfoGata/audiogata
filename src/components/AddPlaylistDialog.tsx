import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@material-ui/core";
import React from "react";
import { useDispatch } from "react-redux";
import { ISong } from "../services/data/database";
import { addPlaylist } from "../store/actions/playlist";

interface IProps {
  open: boolean;
  songs?: ISong[];
  handleClose: () => void;
}

const AddPlaylistDialog: React.FC<IProps> = props => {
  const { open, handleClose } = props;
  const [name, setName] = React.useState("");
  const dispatch = useDispatch();

  function confirm() {
    const tracks = props.songs || [];
    dispatch(addPlaylist(name, tracks));
    handleClose();
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setName(value);
  }

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Add Playlist</DialogTitle>
        <DialogContent>
          <DialogContentText>Give it a name</DialogContentText>
          <TextField
            autoFocus={true}
            margin="dense"
            id="name"
            label="Name"
            type="text"
            fullWidth={true}
            onChange={onChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={confirm} color="primary">
            Add Playlist
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AddPlaylistDialog;
