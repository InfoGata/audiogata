import {
  Box,
  Button,
  CircularProgress,
  CircularProgressProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  List,
  ListItem,
  NativeSelect,
  Typography,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { PluginFrameContainer } from "../PluginsContext";
import usePlugins from "../hooks/usePlugins";
import { PlaylistInfo, Track } from "../plugintypes";
import { useAppDispatch } from "../store/hooks";
import { addPlaylistTracks } from "../store/reducers/playlistReducer";
import { filterAsync } from "../utils";

interface ConvertTracksProps {
  playlist?: PlaylistInfo;
  tracks: Track[];
  open: boolean;
  handleClose: () => void;
}

function CircularProgressWithLabel(
  props: CircularProgressProps & { value: number }
) {
  return (
    <Box sx={{ position: "relative", display: "inline-flex" }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: "absolute",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="caption"
          component="div"
          color="text.secondary"
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

const ConvertTracksDialog: React.FC<ConvertTracksProps> = (props) => {
  const { tracks, playlist, open, handleClose } = props;
  const dispatch = useAppDispatch();
  const [inProgess, setInProgress] = React.useState(false);
  const [completed, setCompleted] = React.useState(false);
  const [numOfTracks, setNumOfTracks] = React.useState(0);
  const [numCompleted, setNumCompleted] = React.useState(0);
  const [failedTracks, setFailedTracks] = React.useState<Track[]>([]);
  const [successfulTracks, setSuccessfulTracks] = React.useState<Track[]>([]);
  const { plugins } = usePlugins();
  const [pluginId, setPluginId] = React.useState<string>();
  const [convertPlugins, setConvertPlugins] = React.useState<
    PluginFrameContainer[]
  >([]);
  const { t } = useTranslation();

  React.useEffect(() => {
    const getPlugins = async () => {
      const convertPlugins = await filterAsync(plugins, (p) =>
        p.hasDefined.onLookupTrack()
      );
      setConvertPlugins(convertPlugins);
      setPluginId(convertPlugins[0]?.id);
    };
    getPlugins();
  }, [plugins]);

  const onConvert = async () => {
    setInProgress(true);
    const plugin = plugins.find((p) => p.id === pluginId);
    setNumCompleted(0);
    setNumOfTracks(tracks.length);
    if (plugin) {
      const success: Track[] = [];
      const failed: Track[] = [];

      for (const track of tracks) {
        console.log(tracks);
        try {
          console.log("success");
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
          console.log("fail");
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
      console.log(successfulTracks);
      dispatch(addPlaylistTracks(playlist, successfulTracks));
      handleClose();
    }
  };

  const onSelectPluginChange = (e: React.FormEvent<HTMLSelectElement>) => {
    setPluginId(e.currentTarget.value);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">{t("convert")}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth>
          <InputLabel variant="standard" htmlFor="uncontrolled-native">
            {t("plugin")}
          </InputLabel>
          <NativeSelect
            value={pluginId}
            onChange={onSelectPluginChange}
            inputProps={{
              name: "plugin",
              id: "uncontrolled-native",
            }}
          >
            {convertPlugins.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </NativeSelect>
        </FormControl>
        <Button variant="contained" disabled={inProgess} onClick={onConvert}>
          {t("convert")}
        </Button>
        {failedTracks.length > 0 && (
          <Box>
            <Typography></Typography>
            <List>
              {failedTracks.map((ft) => (
                <ListItem key={ft.id}>{ft.name}</ListItem>
              ))}
            </List>
          </Box>
        )}
        {inProgess && (
          <CircularProgressWithLabel
            value={(numCompleted / numOfTracks) * 100}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t("cancel")}</Button>
        <Button disabled={!completed} onClick={onConfirm}>
          {t("confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConvertTracksDialog;
