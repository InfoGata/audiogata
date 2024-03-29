import AddPlaylistDialog from "@/components/AddPlaylistDialog";
import DropdownItem, { DropdownItemProps } from "@/components/DropdownItem";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { db } from "@/database";
import { Track } from "@/plugintypes";
import { useAppSelector } from "@/store/hooks";
import {
  ExternalLink,
  ListPlusIcon,
  MoreHorizontal,
  StarIcon,
  StarOffIcon,
} from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { MdAlbum, MdPerson } from "react-icons/md";
import { toast } from "sonner";
import PlaylistSubMenu from "./PlaylistSubMenu";

interface Props {
  track: Track;
  dropdownItems?: DropdownItemProps[];
}

const TrackMenu: React.FC<Props> = (props) => {
  const { track, dropdownItems } = props;
  const { t } = useTranslation();
  const [isFavorited, setIsFavorited] = React.useState(false);
  const [playlistDialogOpen, setPlaylistDialogOpen] = React.useState(false);
  const addVideoToNewPlaylist = () => {
    setPlaylistDialogOpen(true);
  };
  const playlists = useAppSelector((state) => state.playlist.playlists);

  const favoriteTrack = async () => {
    if (track) {
      await db.favoriteTracks.add(track);
      toast(t("addedToFavorites"));
    }
  };

  const removeFavorite = async () => {
    if (track.id) {
      await db.favoriteTracks.delete(track.id);
      toast(t("removedFromFavorites"));
    }
  };

  const items: (DropdownItemProps | undefined)[] = [
    {
      title: isFavorited ? t("removeFromFavorites") : t("addToFavorites"),
      icon: isFavorited ? <StarOffIcon /> : <StarIcon />,
      action: isFavorited ? removeFavorite : favoriteTrack,
    },
    track.albumApiId
      ? {
          title: t("goToAlbum"),
          icon: <MdAlbum />,
          internalPath: `/plugins/${track.pluginId}/albums/${track.albumApiId}`,
        }
      : undefined,
    track.artistApiId
      ? {
          title: t("goToArtist"),
          icon: <MdPerson />,
          internalPath: `/plugins/${track.pluginId}/artists/${track.artistApiId}`,
        }
      : undefined,
    track.originalUrl
      ? {
          title: t("originalUrl"),
          icon: <ExternalLink />,
          url: track.originalUrl,
        }
      : undefined,
    ...(dropdownItems || []),
    {
      title: t("addToNewPlaylist"),
      icon: <ListPlusIcon />,
      action: addVideoToNewPlaylist,
    },
  ];

  const onOpenChange = async (open: boolean) => {
    if (open) {
      if (track.pluginId && track.apiId) {
        const hasFavorite = await db.favoriteTracks.get({
          pluginId: track.pluginId,
          apiId: track.apiId,
        });
        setIsFavorited(!!hasFavorite);
      } else if (track.id) {
        const hasFavorite = await db.favoriteTracks.get(track.id);
        setIsFavorited(!!hasFavorite);
      } else {
        setIsFavorited(false);
      }
    }
  };

  const definedItems = items.filter((i): i is DropdownItemProps => !!i);
  return (
    <>
      <DropdownMenu onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {definedItems.map((i) => (
            <DropdownItem
              key={i.title}
              {...i}
              item={{ type: "track", item: track }}
            />
          ))}
          <PlaylistSubMenu
            title={t("addToPlaylist")}
            playlists={playlists}
            tracks={[track]}
          />
        </DropdownMenuContent>
      </DropdownMenu>
      <AddPlaylistDialog
        tracks={[track]}
        setOpen={setPlaylistDialogOpen}
        open={playlistDialogOpen}
      />
    </>
  );
};

export default TrackMenu;
