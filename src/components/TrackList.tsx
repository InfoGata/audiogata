import { DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import React from "react";
import { useTranslation } from "react-i18next";
import { Track } from "../plugintypes";
import PlaylistItem from "./PlaylistItem";
import Sortable from "./Sortable";
import SortableRow from "./SortableRow";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "./ui/table";
import { Checkbox } from "./ui/checkbox";
import { CheckedState } from "@radix-ui/react-checkbox";
import { DropdownItemProps } from "./DropdownItem";

interface TrackListProps {
  tracks: Track[];
  dragDisabled?: boolean;
  onDragOver?: (newTrackList: Track[]) => void;
  selected?: Set<string>;
  onSelect?: (e: React.MouseEvent, id: string, index: number) => void;
  onSelectAll?: (state: CheckedState) => void;
  isSelected?: (id: string) => boolean;
  onTrackClick: (track: Track) => void;
  menuItems?: DropdownItemProps[];
}

const TrackList: React.FC<TrackListProps> = (props) => {
  const {
    tracks,
    onDragOver,
    onTrackClick,
    onSelect,
    onSelectAll,
    isSelected,
    selected,
    dragDisabled,
    menuItems,
  } = props;
  const [activeId, setActiveId] = React.useState<string | null>(null);
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
      <Table>
        <TableHeader>
          <TableRow>
            {selected && (
              <TableHead>
                <Checkbox
                  onCheckedChange={onSelectAll}
                  checked={
                    (selected.size > 0 && selected.size === tracks.length) ||
                    (selected.size > 0 &&
                      selected.size < tracks.length &&
                      "indeterminate")
                  }
                  aria-label="select all videos"
                />
              </TableHead>
            )}
            <TableHead>{t("title")}</TableHead>
            <TableHead className="hidden md:table-cell">
              {t("trackDuration")}
            </TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tracks.map((track, i) => (
            <SortableRow
              id={track.id || ""}
              key={track.id || track.apiId}
              onClick={() => onTrackClick(track)}
              disabled={dragDisabled}
            >
              <PlaylistItem
                track={track}
                isSelected={isSelected}
                onSelectClick={onSelect}
                index={i}
                menuItems={menuItems}
              />
            </SortableRow>
          ))}
          <DragOverlay wrapperElement="tr">
            {activeId ? (
              <PlaylistItem
                key={activeId}
                track={
                  tracks.find((track) => track.id === activeId) || ({} as Track)
                }
              />
            ) : null}
          </DragOverlay>
        </TableBody>
      </Table>
    </Sortable>
  );
};

export default TrackList;
