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
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import React from "react";
import { useTranslation } from "react-i18next";
import { Track } from "../plugintypes";
import PlaylistItem from "./PlaylistItem";
import Sortable from "./Sortable";
import SortableRow from "./SortableRow";

interface TrackListProps {
  tracks: Track[];
  onTrackClick: (track: Track) => void;
  openMenu: (event: React.MouseEvent<HTMLButtonElement>, track: Track) => void;
  onSelect: (e: React.ChangeEvent<HTMLInputElement>, id: string) => void;
  onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isSelected: (id: string) => boolean;
  selected: Set<string>;
  onDragOver?: (newTrackList: Track[]) => void;
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
  const { t } = useTranslation();

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = tracks.findIndex((item) => item.id === active.id);
      const newIndex = tracks.findIndex((item) => item.id === over?.id);
      const newList = arrayMove(tracks, oldIndex, newIndex);
      if (onDragOver) {
        onDragOver(newList);
      }
    }
    setActiveId(null);
  };

  return (
    <Sortable
      ids={tracks.map((track) => track.id || "")}
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
                    "aria-label": "select all tracks",
                  }}
                />
              </TableCell>
              <TableCell width="80%">{t("title")}</TableCell>
              {showTrackLength && <TableCell>{t("trackDuration")}</TableCell>}
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tracks.map((track, i) => (
              <SortableRow
                id={track.id || ""}
                key={track.id || track.apiId}
                onClick={() => onTrackClick(track)}
                disabled={dragDisabled}
              >
                <PlaylistItem
                  showTrackLength={showTrackLength}
                  track={track}
                  openMenu={openMenu}
                  isSelected={isSelected}
                  onSelectClick={onSelect}
                  index={i}
                />
              </SortableRow>
            ))}
            <DragOverlay wrapperElement="tr">
              {activeId ? (
                <PlaylistItem
                  showTrackLength={showTrackLength}
                  key={activeId}
                  track={
                    tracks.find((track) => track.id === activeId) ||
                    ({} as Track)
                  }
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
