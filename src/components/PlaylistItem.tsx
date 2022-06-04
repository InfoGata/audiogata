import {
  Avatar,
  Box,
  Checkbox,
  IconButton,
  LinearProgress,
  TableCell,
  Typography,
} from "@mui/material";
import React from "react";
import { Song } from "../types";
import { formatSeconds } from "../utils";
import { MoreHoriz } from "@mui/icons-material";
import { useAppSelector } from "../store/hooks";
import { getThumbnailImage, searchThumbnailSize } from "../utils";

interface PlaylistItemsProps {
  song: Song;
  showTrackLength: boolean;
  isSelected?: (id: string) => boolean;
  onSelectClick?: (
    event: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => void;
  openMenu?: (event: React.MouseEvent<HTMLButtonElement>, song: Song) => void;
  index?: number;
}

const PlaylistItem: React.FC<PlaylistItemsProps> = (props) => {
  const { song, showTrackLength, openMenu, onSelectClick, isSelected, index } =
    props;
  const currentSong = useAppSelector((state) => state.song.currentSong);
  const progress = useAppSelector(
    (state) => state.download.progress[song.id || ""]
  );

  const openTrackMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (openMenu) {
      openMenu(event, song);
    }
  };

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onSelectClick) {
      onSelectClick(event, song.id || "");
    }
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const image = getThumbnailImage(song.images, searchThumbnailSize);
  return (
    <>
      <TableCell padding="none">
        {isSelected && (
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
        )}
      </TableCell>
      <TableCell>
        <Box
          sx={{
            display: "flex",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <Avatar alt={song.name} src={image} style={{ borderRadius: 0 }} />
          <Box sx={{ minWidth: 0 }}>
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
          </Box>
        </Box>
      </TableCell>
      {showTrackLength && <TableCell>{formatSeconds(song.duration)}</TableCell>}
      <TableCell align="right" padding="checkbox">
        {openMenu && (
          <IconButton aria-label="options" size="small" onClick={openTrackMenu}>
            <MoreHoriz />
          </IconButton>
        )}
      </TableCell>
    </>
  );
};

export default React.memo(PlaylistItem);
