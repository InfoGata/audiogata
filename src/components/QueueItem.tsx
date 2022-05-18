import {
  Checkbox,
  LinearProgress,
  IconButton,
  TableCell,
  Typography,
} from "@mui/material";
import { MoreHoriz } from "@mui/icons-material";
import React from "react";
import { ISong } from "../models";
import { formatSeconds } from "../utils";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { removeDownload } from "../store/reducers/downloadReducer";
import { useSnackbar } from "notistack";

export interface QueueItemProps {
  song: ISong;
  showTrackLength: boolean;
  isSelected: (id: string) => boolean;
  onSelectClick: (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => void;
  openMenu: (event: React.MouseEvent<HTMLButtonElement>, song: ISong) => void;
  index: number;
}

const QueueItem: React.FC<QueueItemProps> = (props) => {
  const { song, openMenu, showTrackLength, isSelected, onSelectClick, index } =
    props;
  const currentSong = useAppSelector((state) => state.song.currentSong);
  const progress = useAppSelector(
    (state) => state.download.progress[song.id || ""]
  );
  const dispatch = useAppDispatch();
  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(() => {
    if (progress) {
      if (progress.success === true) {
        enqueueSnackbar(`Succesfully downloaded '${song.name}'`);
        dispatch(removeDownload(song.id || ""));
      } else if (progress.success === false) {
        enqueueSnackbar(`Can't download '${song.name}'`, {
          variant: "error",
        });
        dispatch(removeDownload(song.id || ""));
      }
    }
  }, [progress, dispatch, song.id, song.name, enqueueSnackbar]);

  const openSongMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    openMenu(event, song);
  };
  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSelectClick(event, song.id || "");
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <TableCell padding="none">
        <Checkbox
          color="primary"
          checked={isSelected(song.id || "")}
          onChange={onChange}
          onClick={stopPropagation}
          size="small"
          inputProps={
            {
              "data-index": index,
            } as any
          }
        />
      </TableCell>
      <TableCell>
        <Typography
          color={currentSong?.id === song.id ? "primary.main" : undefined}
          noWrap={true}
          dangerouslySetInnerHTML={{ __html: song.name }}
          sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
        />
        <Typography
          variant="body2"
          color={currentSong?.id === song.id ? "primary.main" : undefined}
          noWrap={true}
          dangerouslySetInnerHTML={{ __html: song.artistName || "" }}
          sx={{ overflow: "hidden", textOverflow: "ellipsis" }}
        />
        <LinearProgress
          variant="determinate"
          value={progress?.progress || 0}
          sx={{ visibility: progress ? "visible" : "hidden" }}
        />
      </TableCell>
      {showTrackLength && <TableCell>{formatSeconds(song.duration)}</TableCell>}
      <TableCell align="right">
        <IconButton aria-label="options" size="small" onClick={openSongMenu}>
          <MoreHoriz />
        </IconButton>
      </TableCell>
    </>
  );
};

export default QueueItem;
