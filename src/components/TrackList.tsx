import { DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React from "react";
import { ISong } from "../types";
import PlaylistItem from "./PlaylistItem";
import Sortable from "./Sortable";
import SortableRow from "./SortableRow";

interface TrackListProps {
  tracks: ISong[];
  onDragOver: (newTrackList: ISong[]) => void;
  onTrackClick: (track: ISong) => void;
  openMenu: (event: React.MouseEvent<HTMLButtonElement>, song: ISong) => void;
  onSelect: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isSelected: (id: string) => boolean;
  selected: Set<string>;
  dragDisabled?: boolean;
}

const TrackList: React.FC<TrackListProps> = (props) => {
  const {
    tracks,
    onDragOver,
    onTrackClick,
    openMenu,
    onSelect,
    onSelectAll,
    isSelected,
    selected,
    dragDisabled,
  } = props;
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const theme = useTheme();
  const showTrackLength = useMediaQuery(theme.breakpoints.up("sm"));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = tracks.findIndex((item) => item.id === active.id);
      const newIndex = tracks.findIndex((item) => item.id === over?.id);
      const newList = arrayMove(tracks, oldIndex, newIndex);
      onDragOver(newList);
    }
    setActiveId(null);
  };

  return (
    <Sortable
      ids={tracks.map((s) => s.id || "")}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <TableContainer component={Paper}>
        <Table size="small" sx={{ tableLayout: "fixed" }}>
          <TableHead>
            <TableRow>
              <TableCell padding="none" width="4%">
                <Checkbox
                  color="primary"
                  indeterminate={
                    selected.size > 0 && selected.size < tracks.length
                  }
                  checked={tracks.length > 0 && selected.size === tracks.length}
                  onChange={onSelectAll}
                  size="small"
                  inputProps={{
                    "aria-label": "select all desserts",
                  }}
                />
              </TableCell>
              <TableCell width="80%">Title</TableCell>
              {showTrackLength && <TableCell>Track Length</TableCell>}
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tracks.map((s) => (
              <SortableRow
                id={s.id || ""}
                key={s.id}
                onClick={onTrackClick}
                disabled={dragDisabled}
              >
                <PlaylistItem
                  showTrackLength={showTrackLength}
                  key={s.id}
                  song={s}
                  openMenu={openMenu}
                  isSelected={isSelected}
                  onSelectClick={onSelect}
                />
              </SortableRow>
            ))}
            <DragOverlay wrapperElement="tr">
              {activeId ? (
                <PlaylistItem
                  showTrackLength={showTrackLength}
                  key={activeId}
                  song={tracks.find((s) => s.id === activeId) || ({} as ISong)}
                />
              ) : null}
            </DragOverlay>
          </TableBody>
        </Table>
      </TableContainer>
    </Sortable>
  );
};

export default TrackList;
