import { DropdownMenu } from "@radix-ui/react-dropdown-menu";
import {
  ListPlusIcon,
  ListVideoIcon,
  MoreHorizontalIcon,
  StarIcon,
  StarOffIcon,
} from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { PlaylistInfo, Track } from "../plugintypes";
import { useAppDispatch } from "../store/hooks";
import { addTracks } from "../store/reducers/trackReducer";
import AddPlaylistDialog from "./AddPlaylistDialog";
import DropdownItem, { DropdownItemProps } from "./DropdownItem";
import PlaylistSubMenu from "./PlaylistSubMenu";
import { Button } from "./ui/button";
import {
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface PlaylistMenuProps {
  playlists: PlaylistInfo[];
  selected?: Set<string>;
  tracklist: Track[];
  isFavorite?: boolean;
  noQueueItem?: boolean;
  onFavorite?: () => void;
  onRemoveFavorite?: () => void;
  dropdownItems?: DropdownItemProps[];
  selectedDropdownItems?: DropdownItemProps[];
}

const PlaylistMenu: React.FC<PlaylistMenuProps> = (props) => {
  const {
    playlists,
    selected,
    tracklist,
    isFavorite,
    onFavorite,
    onRemoveFavorite,
    noQueueItem,
    dropdownItems,
    selectedDropdownItems,
  } = props;
  const { t } = useTranslation();
  const [playlistDialogTracks, setPlaylistDialogTracks] = React.useState<
    Track[]
  >([]);
  const [playlistDialogOpen, setPlaylistDialogOpen] = React.useState(false);
  const dispatch = useAppDispatch();

  const selectedTracks = selected
    ? tracklist.filter((t) => selected.has(t.id ?? ""))
    : [];

  const addPlaylistToQueue = () => {
    dispatch(addTracks(tracklist));
    toast(t("tracksAddedToQueue"));
  };

  const addSelectedToQueue = () => {
    dispatch(addTracks(selectedTracks));
    toast(t("tracksAddedToQueue"));
  };

  const addSelectedToNewPlaylist = () => {
    setPlaylistDialogTracks(selectedTracks);
    setPlaylistDialogOpen(true);
  };

  const addToNewPlaylist = () => {
    setPlaylistDialogTracks(tracklist);
    setPlaylistDialogOpen(true);
  };

  const items: (DropdownItemProps | undefined)[] = [
    ...(dropdownItems || []),
    noQueueItem
      ? undefined
      : {
          title: t("addTracksToQueue"),
          icon: <ListVideoIcon />,
          action: addPlaylistToQueue,
        },
    {
      title: t("addTracksToNewPlaylist"),
      icon: <ListPlusIcon />,
      action: addToNewPlaylist,
    },
    onFavorite
      ? {
          title: isFavorite ? t("removeFromFavorites") : t("addToFavorites"),
          icon: isFavorite ? <StarOffIcon /> : <StarIcon />,
          action: isFavorite ? onRemoveFavorite : onFavorite,
        }
      : undefined,
  ];
  const definedItems = items.filter((i): i is DropdownItemProps => !!i);

  const selectedItems: (DropdownItemProps | undefined)[] = [
    ...(selectedDropdownItems || []),
    noQueueItem
      ? undefined
      : {
          title: t("addSelectedToQueue"),
          icon: <ListVideoIcon />,
          action: addSelectedToQueue,
        },
    {
      title: t("addSelectedToNewPlaylist"),
      icon: <ListPlusIcon />,
      action: addSelectedToNewPlaylist,
    },
  ];
  const definedSelectedItems = selectedItems.filter(
    (i): i is DropdownItemProps => !!i
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="w-16 h-16">
            <MoreHorizontalIcon className="w-14 h-14" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {definedItems.map((i) => (
            <DropdownItem key={i.title} {...i} />
          ))}
          <PlaylistSubMenu
            title={t("addToPlaylist")}
            playlists={playlists}
            tracks={tracklist}
          />
          {selected && selected.size
            ? [
                <DropdownMenuSeparator key="seperator" />,
                ...definedSelectedItems.map((i) => (
                  <DropdownItem key={i.title} {...i} />
                )),
                <PlaylistSubMenu
                  key="playlists"
                  title={t("addSelectedToPlaylist")}
                  playlists={playlists}
                  tracks={selectedTracks}
                />,
              ]
            : []}
        </DropdownMenuContent>
      </DropdownMenu>
      <AddPlaylistDialog
        tracks={playlistDialogTracks}
        open={playlistDialogOpen}
        setOpen={setPlaylistDialogOpen}
      />
    </>
  );
};

export default PlaylistMenu;
