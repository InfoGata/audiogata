import React from "react";
import { useTranslation } from "react-i18next";
import usePlugins from "../hooks/usePlugins";
import { PlaylistInfo, Track } from "../plugintypes";
import { useAppDispatch } from "../store/hooks";
import { addPlaylistTracks } from "../store/reducers/playlistReducer";
import SelectPlugin from "./SelectPlugin";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface ConvertTracksProps {
  playlist?: PlaylistInfo;
  tracks: Track[];
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ConvertTracksDialog: React.FC<ConvertTracksProps> = (props) => {
  const { tracks, playlist, open, setOpen } = props;
  const dispatch = useAppDispatch();
  const [inProgess, setInProgress] = React.useState(false);
  const [completed, setCompleted] = React.useState(false);
  const [numOfTracks, setNumOfTracks] = React.useState(0);
  const [numCompleted, setNumCompleted] = React.useState(0);
  const [failedTracks, setFailedTracks] = React.useState<Track[]>([]);
  const [successfulTracks, setSuccessfulTracks] = React.useState<Track[]>([]);
  const { plugins } = usePlugins();
  const [pluginId, setPluginId] = React.useState<string>();
  const { t } = useTranslation();

  const onConvert = async () => {
    setInProgress(true);
    const plugin = plugins.find((p) => p.id === pluginId);
    setNumCompleted(0);
    setNumOfTracks(tracks.length);
    if (plugin) {
      const success: Track[] = [];
      const failed: Track[] = [];

      for (const track of tracks) {
        try {
          const newTrack = await plugin.remote.onLookupTrack({
            artistName: track.artistName,
            trackName: track.name,
          });
          newTrack.id = track.id;
          newTrack.artistName = newTrack.artistName ?? track.artistName;
          newTrack.albumName = newTrack.albumName ?? track.albumName;
          success.push(newTrack);
          setNumCompleted((n) => n + 1);
        } catch {
          failed.push(track);
        }
      }
      setSuccessfulTracks(success);
      setFailedTracks(failed);
      setCompleted(true);
    }
  };

  const onConfirm = () => {
    if (playlist) {
      dispatch(addPlaylistTracks(playlist, successfulTracks));
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("convert")}</DialogTitle>
        </DialogHeader>
        <SelectPlugin
          methodName="onLookupTrack"
          pluginId={pluginId || ""}
          setPluginId={setPluginId}
        />
        <Button disabled={inProgess} onClick={onConvert}>
          {t("convert")}
        </Button>
        {failedTracks.length > 0 &&
          failedTracks.map((ft) => <p key={ft.id}>{ft.name}</p>)}
        {inProgess && <p>{(numCompleted / numOfTracks) * 100} %</p>}
        <DialogFooter>
          <Button onClick={() => setOpen(false)}>{t("cancel")}</Button>
          <Button disabled={!completed} onClick={onConfirm}>
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConvertTracksDialog;
