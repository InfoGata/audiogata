import React from "react";
import { useTranslation } from "react-i18next";
import { Playlist, Track } from "../plugintypes";
import { useAppDispatch } from "../store/hooks";
import { addPlaylist } from "../store/reducers/playlistReducer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";

interface AddPlaylistDialogProps {
  open: boolean;
  tracks?: Track[];
  setOpen: (open: boolean) => void;
}

const AddPlaylistDialog: React.FC<AddPlaylistDialogProps> = (props) => {
  const { open, setOpen } = props;
  const [name, setName] = React.useState("");
  const formId = React.useId();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tracks = props.tracks || [];
    const playlist: Playlist = {
      name,
      tracks: tracks,
    };
    dispatch(addPlaylist(playlist));
    toast(t("playlistCreated"));
    setOpen(false);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("addPlaylist")}</DialogTitle>
          <DialogDescription>{t("givePlaylistName")}</DialogDescription>
        </DialogHeader>
        <form id={formId} onSubmit={onSubmit}>
          <Input
            autoFocus={true}
            id="name"
            type="text"
            value={name}
            onChange={onChange}
            placeholder={t("playlistName")}
          />
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t("cancel")}
          </Button>
          <Button variant="outline" type="submit" form={formId}>
            {t("addPlaylist")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(AddPlaylistDialog);
