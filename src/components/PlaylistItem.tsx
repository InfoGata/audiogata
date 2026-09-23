import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";
import React from "react";
import { Track } from "../plugintypes";
import { useAppSelector } from "../store/hooks";
import { formatSeconds, getThumbnailImage } from "@infogata/utils";
import { searchThumbnailSize } from "../utils";
import ArtistLinks from "./ArtistLinks";
import { DropdownItemProps } from "./DropdownItem";
import TrackMenu from "./TrackMenu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Checkbox } from "./ui/checkbox";
import { Progress } from "./ui/progress";
import { TableCell } from "./ui/table";
import { AudioLinesIcon, MusicIcon, PlayIcon } from "lucide-react";

interface PlaylistItemsProps {
  track: Track;
  isSelected?: (id: string) => boolean;
  onSelectClick?: (event: React.MouseEvent, id: string, index: number) => void;
  index?: number;
  menuItems?: DropdownItemProps[];
  noQueueItem?: boolean;
  isCurrent?: boolean;
  isPlaying?: boolean;
}

const PlaylistItem: React.FC<PlaylistItemsProps> = (props) => {
  const {
    track,
    onSelectClick,
    isSelected,
    index,
    noQueueItem,
    menuItems,
    isCurrent,
    isPlaying,
  } = props;
  const sanitizer = DOMPurify.sanitize;
  const progress = useAppSelector(
    (state) => state.download.progress[track.id || ""],
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
        <TableCell className="w-8">
          {
            <Checkbox
              checked={isSelected(track.id || "")}
              onClick={onCheckboxClick}
            />
          }
        </TableCell>
      )}
      <TableCell className="w-10 pr-0 text-center text-muted-foreground tabular-nums">
        {isCurrent ? (
          <AudioLinesIcon
            className={cn(
              "mx-auto size-4 text-primary",
              isPlaying && "animate-pulse",
            )}
          />
        ) : (
          <>
            <span className="group-hover:hidden">
              {index !== undefined ? index + 1 : ""}
            </span>
            <PlayIcon className="mx-auto hidden size-4 fill-current text-foreground group-hover:block" />
          </>
        )}
      </TableCell>
      <TableCell className="w-full max-w-0">
        <div className="flex items-center gap-3">
          <Avatar className="rounded-md">
            <AvatarImage src={image} className="object-cover" />
            <AvatarFallback className="rounded-md">
              <MusicIcon className="size-4 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p
              dangerouslySetInnerHTML={{ __html: sanitizer(track.name) }}
              title={track.name}
              className={cn(
                "truncate font-medium",
                isCurrent && "text-primary",
              )}
            />
            <p className="truncate text-muted-foreground [&_a:hover]:text-foreground [&_a:hover]:underline">
              {track.artistApiId ? (
                <ArtistLinks item={track} />
              ) : (
                <span
                  dangerouslySetInnerHTML={{
                    __html: sanitizer(track.artistName || ""),
                  }}
                />
              )}
            </p>
            <Progress
              className={cn("mt-1 h-1", !progress && "hidden")}
              value={progress?.progress || 0}
            />
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden w-20 text-right text-muted-foreground tabular-nums md:table-cell">
        {track.duration ? formatSeconds(track.duration) : ""}
      </TableCell>
      <TableCell className="w-12 text-right">
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
