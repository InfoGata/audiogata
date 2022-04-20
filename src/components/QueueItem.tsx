import { Checkbox, IconButton, TableCell, Typography } from "@mui/material";
import { MoreHoriz } from "@mui/icons-material";
import React from "react";
import { ISong } from "../models";
import { formatSeconds } from "../utils";
import { useAppSelector } from "../store/hooks";

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
      <TableCell>
        <Checkbox
          color="primary"
          checked={isSelected(song.id || "")}
          onChange={onChange}
          onClick={stopPropagation}
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
        />
      </TableCell>
      {showTrackLength && <TableCell>{formatSeconds(song.duration)}</TableCell>}
      <TableCell>
        <IconButton aria-label="options" size="small" onClick={openSongMenu}>
          <MoreHoriz />
        </IconButton>
      </TableCell>
    </>
  );
};

export default QueueItem;
