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
import { useAppSelector } from "@/store/hooks";
import { ClockIcon } from "lucide-react";

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
  noQueueItem?: boolean;
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
    noQueueItem,
  } = props;
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const { t } = useTranslation();
  const currentTrack = useAppSelector((state) => state.track.currentTrack);
  const isPlaying = useAppSelector((state) => state.track.isPlaying);

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
      <Table className="[&_td]:px-2 [&_td]:py-2 [&_th]:h-9 [&_th]:px-2">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {selected && (
              <TableHead className="w-8">
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
            <TableHead className="w-10 pr-0 text-center">#</TableHead>
            <TableHead>{t("title")}</TableHead>
            <TableHead className="hidden w-20 text-right md:table-cell">
              <ClockIcon
                className="ml-auto size-4"
                aria-label={t("trackDuration")}
              />
            </TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tracks.map((track, i) => {
            const isCurrent = !!track.id && currentTrack?.id === track.id;
            return (
              <SortableRow
                id={track.id || ""}
                key={track.id || track.apiId}
                onClick={() => onTrackClick(track)}
                disabled={dragDisabled}
                currentItem={isCurrent}
              >
                <PlaylistItem
                  track={track}
                  isSelected={isSelected}
                  onSelectClick={onSelect}
                  index={i}
                  menuItems={menuItems}
                  noQueueItem={noQueueItem}
                  isCurrent={isCurrent}
                  isPlaying={isCurrent && isPlaying}
                />
              </SortableRow>
            );
          })}
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
