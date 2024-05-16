import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";
import React from "react";
import { Track } from "../plugintypes";
import { useAppSelector } from "../store/hooks";
import {
  formatSeconds,
  getThumbnailImage,
  searchThumbnailSize,
} from "../utils";
import ArtistLinks from "./ArtistLinks";
import { DropdownItemProps } from "./DropdownItem";
import TrackMenu from "./TrackMenu";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Checkbox } from "./ui/checkbox";
import { Progress } from "./ui/progress";
import { TableCell } from "./ui/table";

interface PlaylistItemsProps {
  track: Track;
  isSelected?: (id: string) => boolean;
  onSelectClick?: (event: React.MouseEvent, id: string, index: number) => void;
  index?: number;
  menuItems?: DropdownItemProps[];
  noQueueItem?: boolean;
}

const PlaylistItem: React.FC<PlaylistItemsProps> = (props) => {
  const { track, onSelectClick, isSelected, index, noQueueItem, menuItems } =
    props;
  const sanitizer = DOMPurify.sanitize;
  const progress = useAppSelector(
    (state) => state.download.progress[track.id || ""]
  );

  const onCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectClick && index !== undefined) {
      onSelectClick(e, track.id || "", index);
    }
  };

  const image = getThumbnailImage(track.images, searchThumbnailSize);
  return (
    <>
      {isSelected && (
        <TableCell>
          {
            <Checkbox
              checked={isSelected(track.id || "")}
              onClick={onCheckboxClick}
            />
          }
        </TableCell>
      )}
      <TableCell>
        <div className="flex">
          <Avatar className="rounded-none">
            <AvatarImage src={image} />
          </Avatar>
          <div className="min-w-0">
            <p
              dangerouslySetInnerHTML={{ __html: sanitizer(track.name) }}
              title={track.name}
              className="truncate"
            />
            {track.artistApiId ? (
              <ArtistLinks item={track} />
            ) : (
              <p
                dangerouslySetInnerHTML={{
                  __html: sanitizer(track.artistName || ""),
                }}
                className="truncate"
              />
            )}
            <Progress
              className={cn(!progress && "hidden")}
              value={progress?.progress || 0}
            />
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        {formatSeconds(track.duration)}
      </TableCell>
      <TableCell align="right">
        <TrackMenu
          noQueueItem={noQueueItem}
          track={track}
          dropdownItems={menuItems}
        />
      </TableCell>
    </>
  );
};

export default React.memo(PlaylistItem);
