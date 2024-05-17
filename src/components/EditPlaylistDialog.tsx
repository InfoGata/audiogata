import React from "react";
import { useTranslation } from "react-i18next";
import { PlaylistInfo } from "../plugintypes";
import { useAppDispatch } from "../store/hooks";
import { updatePlaylist } from "../store/reducers/playlistReducer";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface EditPlaylistDialogProps {
  open: boolean;
  playlist: PlaylistInfo;
  setOpen: (open: boolean) => void;
}

const EditPlaylistDialog: React.FC<EditPlaylistDialogProps> = (props) => {
  const { open, playlist, setOpen } = props;
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
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("editPlaylist")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} id={formId}>
          <Input
            autoFocus={true}
            id="name"
            placeholder={t("playlistName")}
            type="text"
            value={name}
            onChange={onChange}
          />
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("cancel")}
          </Button>
          <Button variant="outline" type="submit" form={formId}>
            {t("updatePlaylist")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPlaylistDialog;
