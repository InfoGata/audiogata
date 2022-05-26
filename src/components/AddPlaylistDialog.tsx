import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import React from "react";
import { IPlaylist, ISong } from "../types";
import { useAppDispatch } from "../store/hooks";
import { addPlaylist } from "../store/reducers/playlistReducer";

interface IProps {
  open: boolean;
  songs?: ISong[];
  handleClose: () => void;
}

const AddPlaylistDialog: React.FC<IProps> = (props) => {
  const { open, handleClose } = props;
  const [name, setName] = React.useState("");
  const dispatch = useAppDispatch();

  const confirm = () => {
    const tracks = props.songs || [];
    const playlist: IPlaylist = {
      name,
      songs: tracks,
    };
    dispatch(addPlaylist(playlist));
    handleClose();
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
  };

  return (
    <form onSubmit={confirm}>
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
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={confirm}>Add Playlist</Button>
        </DialogActions>
      </Dialog>
    </form>
  );
};

export default React.memo(AddPlaylistDialog);
