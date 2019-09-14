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
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import { ISong } from "../services/data/database";
import { addPlaylist, addSongs } from "../store/actions/playlist";
import { AppState } from "../store/store";

interface IProps extends DispatchProps {
  open: boolean;
  songs?: ISong[];
  handleClose: () => void;
}

const AddPlaylistDialog = (props: IProps) => {
  const { open, handleClose } = props;
  const [name, setName] = React.useState("");

  function confirm() {
    const tracks = props.songs || [];
    props.addPlaylist(name, tracks);
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

const mapStateToProps = (state: AppState) => ({});

const mapDispatchToProps = (dispatch: Dispatch) =>
  bindActionCreators(
    {
      addPlaylist,
      addSongs,
    },
    dispatch,
  );
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
const connectedComponent = connect(
  mapStateToProps,
  mapDispatchToProps,
)(AddPlaylistDialog);
export default connectedComponent;
